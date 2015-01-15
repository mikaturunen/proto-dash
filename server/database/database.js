"use strict";

var Q = require("q");
var mongo = require("mongodb");
var MongoClient = mongo.MongoClient;

var config = require("../config/config.json");
// TODO replace the default values in the configuration file (and please, do not push them into github :))
var connectionString = "mongodb://" + config.user + ":" + config.password + "@" + config.url + ":" + config.databasePort + "/" + config.database;
var database;

module.exports = {
    init: function() {
        var deferred = Q.defer();

        Q.ninvoke(MongoClient, "connect", connectionString)
            .then(function(connectedDatabase) {
                database = connectedDatabase;
                deferred.resolve(true);
            })
            .catch(deferred.reject)
            .done();

        return deferred.promise;
    },
    
    getCollection: function(collection) {
        if (database) {
            return function() {
                console.log("Returning requested collection.", collection);
                return database.collection(collection);
            };
        } 

        // We should never hit here but this is here just in case. We allow it to operate but at the same time
        // capture potential cases that we've missed.
        console.log("Database not in place. Check connection and error cases.", collection);
        database = client.db(config.database);
        return getCollection(collection);
    }
};