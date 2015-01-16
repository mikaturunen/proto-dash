"use strict";

var path = require("path");
var express = require("express");
var app = express();
var database = require("./database/database");
var Q = require("q");

var initRoutes = function() {
    var deferred = Q.defer();
    var releaseDirectory = path.join(__dirname, "..");
    
    // NOTE this is not async function, we just use it through promise to allow clean and readable promise chain
    
    // creating a iterable list of static url we can safely use from the browser without express involving itself 
    // with them too much
    var staticRouteMappings = [
        { directory: path.join(releaseDirectory, "client"), url: "/public" },
        { directory: path.join(releaseDirectory, "../node_modules/socket.io-client/socket.io.js"), url: "/socket.io.js" }
    ];

    app.set("port", (process.env.PORT || 3000));
    staticRouteMappings.forEach(function(mapping) {
        app.use(mapping.url, express.static(mapping.directory));                      
    });

    // From all other routes we return index.html for now... 
    app.get("*", function(request, response) {
        var indexHtml = path.join(releaseDirectory, "client", "html", "index.html");
        response.sendFile(indexHtml);
    });
    deferred.resolve(true);
    
    return deferred.promise;
};

var initServer = function() {
    var deferred = Q.defer();
    
    var server = app.listen(app.get("port"), function() {
        console.log("Node app is running at localhost:" + app.get('port'));
        deferred.resolve(server);
    });
    
    return deferred.promise;
};

var initSockets = function(server) {
    var deferred = Q.defer();
    
    // TODO move the socket initialization into its own place
    var socket = require("socket.io");
    var io = socket(server);
    var constants = require("./utilities/constants")
    var database = require("./database/database");

    // TODO move the socket code and hooks into a separate file
    io.on(constants.events.socket.connected, function(socket) {
        console.log("Socket connected to server.",socket.id);

        socket.on("dash.get.dashboard", function(parameters, resultHandler) {
            console.log("Received socket get.dasboard");
            database
                .findDashboardsForEmail("mika.turunen@ymail.com")
                .then(function(results) {
                    resultHandler(null, results);
                })
                .catch(function(error) {
                    resultHandler(error);
                })
                .done();
        });

        socket.on(constants.events.socket.disconnected, function() {
            console.log("Socket disconnected from server.", socket.id);
        });
    });
    
    return deferred.promise;
};

initRoutes()
    .then(function() { return database.init(); })
    .then(function() { return initServer(); })
    .then(function(server) { return initSockets(server); })
    .catch(function(error) { 
        console.log(error);
        process.exit(6);
    })
    .done();
