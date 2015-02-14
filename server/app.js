/* global console, require, __dirname, process, module */
/* jshint node: true */
/* jshint esnext: true */

"use strict";

var path = require("path");
var express = require("express");
var app = express();
var database = require("./database/database");
var Q = require("q");
var rowTransformer = require("./transformers/row-transformer");

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
    app.set("port", port);
    
    staticRouteMappings.forEach(mapping => {
        app.use(mapping.url, express.static(mapping.directory));                      
    });

    // From all other routes we return index.html for now... 
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

/** 
 * Initializes all the Socket.io connections and messages available in the application.
 * @returns {Q.Promise} Resolves on success.
 */
var initSockets = server => {
    var deferred = Q.defer();
    
    // TODO move the socket initialization into its own place
    var socket = require("socket.io");
    var io = socket(server);
    var constants = require("./utilities/constants");
    var database = require("./database/database");

    // TODO move the socket code and hooks into a separate file
    io.on(constants.events.socket.connected, socket => {
        console.log("Socket connected to server.",socket.id);

        socket.on("dash.get.dashboard", (parameters, resultHandler) => {
            console.log("Received socket get.dasboard");
            database
                .findDashboardsForEmail(parameters)
                .then(results => {
                    resultHandler(null, !results || results.length <= 0 ? [] : results);
                })
                .catch(error => {
                    resultHandler(error);
                })
                .done();
        });
        
        socket.on("dash.get.dashboard.components", (parameters, resultHandler) => {
            console.log("Received socket get.dasboard.components", JSON.stringify(parameters));

            if (!parameters) {
                resultHandler("No components");
                return;
            }

            database
                .findComponentsForDashboard(parameters, rowTransformer(parameters))
                .then(results => {
                    resultHandler(null, results);
                })
                .catch(error => {
                    resultHandler(error);
                })
                .done();
        });

        socket.on(constants.events.socket.disconnected, () => {
            console.log("Socket disconnected from server.", socket.id);
        });
    });
    
    return deferred.promise;
};

// Start the application through the Promise-chain
initRoutes()
    .then(() => database.init())
    .then(() => initServer())
    .then(server => initSockets(server))
    .catch(error => { 
        console.log(error);
        process.exit(6);
    })
    .done();
