/* global console, require, __dirname, process, module */
/* jshint node: true */
"use strict";

var Q = require("q");
var mongo = require("mongodb");
var ObjectID = mongo.ObjectID;
var MongoClient = mongo.MongoClient;
var _ = require("lodash");
var config = require("../config/config");
var connectionString = "mongodb://" + config.databaseUser + ":" + 
    config.databasePassword + "@" + 
    config.databaseUrl + ":" + 
    config.databasePort + "/" + 
    config.database;
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

            deferred.resolve(documents);
        });

    return deferred.promise;  
};

var collectComponentsFromRows = function(rows) {
    // the columns are built of components (columns, single column = single component)
    
    var component_ids = _.flatten(rows.map(function(rowColumns) {
        return rowColumns.map(function(component_id) {  
            return new ObjectID(component_id);
        });
    }));
    
    console.log("Collected component_ids for Dashboard.", component_ids);
    return component_ids;
};

module.exports = {
    init: init,
    getCollection: getCollection,

    findComponentsForDashboard: function(rows_component_ids, transformer) {
        if (transformer !== undefined) {
            var deferred = Q.defer();
            
            // transformer enabled where the results are projected/transformed into something else
            find(components, { _id: { $in: collectComponentsFromRows(rows_component_ids) } })
                .then(function(results) {
                    deferred.resolve(transformer(results));
                }) 
                .catch(function(error) {
                    console.error(error);
                    deferred.reject(error);
                })
                .done();
           
            return deferred.promise;
        } else {
            // raw resulting query
            return find(components, { _id: { $in: collectComponentsFromRows(rows_component_ids) } });
        }
    },
    
    findDashboardsForEmail: function(email) {
        return find(dashboard, { for_emails: { $in: [ email ] }});
    }
};