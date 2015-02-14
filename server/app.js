/* global console, require, __dirname, process, module */
/* jshint node: true */
/* jshint esnext: true */

"use strict";

var path = require("path");
var express = require("express");
var app = express();
var database = require("./database/database");
var Q = require("q");
var socket = require("./socket/socket");

/** 
 * Initializes all the express HTTP specific routes. 
 * @return {Q.Promise} Resolves on success.
 */ 
var initRoutes = () => {
    var deferred = Q.defer();
    var releaseDirectory = path.join(__dirname, "..");
    
    // NOTE this is not async function, we just use it through promise to allow clean and readable promise chain
    
    // creating a iterable list of static url we can safely use from the browser without express involving itself 
    // with them too much
    var staticRouteMappings = [
        { directory: path.join(releaseDirectory, "client"), url: "/public" },
        { directory: path.join(releaseDirectory, "../node_modules/socket.io-client/socket.io.js"), url: "/socket.io.js" }
    ];

    // This custom variable overwrites all other port variables
    var port = process.env.DEV_PORT ? process.env.DEV_PORT : (process.env.PORT || 3000);
    // Another specific hook for development environment easing
    if (process.argv.length >= 3) {
        console.log("Argument for port given, using port number", process.argv[2]);
        port = parseInt(process.argv[2]);
    }
    app.set("port", port);
    
    staticRouteMappings.forEach(mapping => {
        app.use(mapping.url, express.static(mapping.directory));                      
    });

    // From all other routes we return index.html for now... 
    // TODO 404 instead of serving the rough index.html and letting JS sort itself out
    app.get("*", (request, response) => {
        var indexHtml = path.join(releaseDirectory, "client", "html", "index.html");
        response.sendFile(indexHtml);
    });
    deferred.resolve(true);
    
    return deferred.promise;
};

/** 
 * Initializes the express server itself.
 * @returns {Q.Promise} Resolves on success.
 */ 
var initServer = () => {
    var deferred = Q.defer();
    
    var server = app.listen(app.get("port"), () => {
        console.log("Node app is running at localhost:" + app.get('port'));
        deferred.resolve(server);
    });
    
    return deferred.promise;
};

// Start the application through the Promise-chain
initRoutes()
    .then(() => database.init())
    .then(() => initServer())
    .then(server => socket.init(server))
    .then(() => socket.hookSocketMessages())
    .catch(error => { 
        console.log(error);
        process.exit(6);
    })
    .done();
