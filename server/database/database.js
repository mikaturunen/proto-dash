"use strict";

var Q = require("q");
var mongo = require("mongodb");
var MongoClient = mongo.MongoClient;
var ObjectID = require('mongodb').ObjectID;

var config = require("../config/config.json");
// TODO replace the default values in the configuration file (and please, do not push them into github :))
var connectionString = "mongodb://" + config.user + ":" + config.password + "@" + config.url + ":" + config.databasePort + "/" + config.database;
var database;

// Collections 
// NOTE if the collections related code gets too out of hand, move it to its own module
var dashboard;
var components;

var init = function() {
    var deferred = Q.defer();

    Q.ninvoke(MongoClient, "connect", connectionString)
        .then(function(connectedDatabase) {
            database = connectedDatabase;
            dashboard = getCollection("dashboard")();
            components = getCollection("components")();
            deferred.resolve(true);
        })
        .catch(deferred.reject)
        .done();

    return deferred.promise;
};

var getCollection = function(collection) {
    if (!database) {
        throw "No connection to database.";
    } 

    return function() {
        console.log("Returning requested collection.", collection);
        return database.collection(collection);
    };
};

var find = function(collection, query) {
   var deferred = Q.defer();
        
    if (collection.find === undefined) {
        deferred.reject("No find function in collection.");
        return;
    }
    
    collection
        .find(query)
        .toArray(function(error, documents) {
            if (error) {
                console.log("Error getting documents for collection.", error);
                deferred.reject(documents);
                return;
            }

            console.log("documents:", documents);
            deferred.resolve(documents);
        });

    return deferred.promise;  
};

var collectComponentsFromRows = function(dashboards) {
    var components = [];
    
    dashboards.forEach(function(dashboard) {
        dashboard.rows.forEach(function(row) {
            Object.keys(row).forEach(function(key) {
               components.push(new ObjectID(row[key].component_id)); 
            });
        });
    });
    
    console.log("Collected component_ids for Dashboard.", components);
    return components;
};

module.exports = {
    init: init,
    getCollection: getCollection,
    
    findDashboardsForEmail: function(email) {
        var deferred = Q.defer();
        
        find(dashboard, { for_emails: { $in: [ email ] }})
            .then(function(dashboardDocuments) {
                var deferred = Q.defer();

                find(components, { _id: { $in: collectComponentsFromRows(dashboardDocuments) } })
                    .then(function(componentDocuments) {
                        deferred.resolve({
                            dashboards: dashboardDocuments,
                            components: componentDocuments
                        });
                    })
                    .catch(function(error) {
                        console.error(error);
                        deferred.reject(error);
                    })
                    .done();
                
                return deferred.promise;
            })
            .then(function(results) {
                deferred.resolve(results);
            })
            .catch(function(error) {
                deferred.reject(error);
            })
            .done();
        
        return deferred.promise; 
    }
};