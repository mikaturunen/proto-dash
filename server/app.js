/* global console, require, __dirname, process, module */
/* jshint node: true */
/* jshint esnext: true */

"use strict";

var path = require("path");
var express = require("express");
var app = express();
var database = require("./database/database");
var Q = require("q");

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

    app.set("port", (process.env.PORT || 3000));
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

// TODO move the transformers into their own module. they are taking too much space and bring in unnecessary glutter here
var _ = require("lodash");
var mongo = require("mongodb");
var ObjectID = mongo.ObjectID;
/** 
 * Transformers the array of resulting component documents into the rows x columns format specified in the dashboard
 * that rows_component_ids represent with pure englighted magic and unicorns.
 * @param {string[][]} rows_component_ids 2d array with the first layer being rows and the second dimension being columns
 * @returns Components transformed into the replica of rows_component_ids but instead of id's, the actual objects
 */
var arrangeComponentsIntoRowsTransformer = (rows_component_ids) => {
    return (results) => {
        // don't ask, I'm just throwing some map magic at it. Basically what is being done is I want the actual objects
        // to represent the rows in the exact same format as rows_component_ids are. So rows_component_ids describe
        // the format for us and we just fill in the details with the map magic and store the component objects in the 
        // exactly same format as the rows_component_ids is: Array<Array<Object>>, number or rows and colums is dynamic
        
        return rows_component_ids.map(rowColumns => {
            return rowColumns.map(component_id => { 
                // we make sure that we never get undefined into the collection. Makes our life a little easier on front
                var component = _.find(results, componentDocument => {
                    return componentDocument._id.equals(component_id);
                }) || { }; 
               return component;
            });
        });
    };
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
                .findComponentsForDashboard(parameters, arrangeComponentsIntoRowsTransformer(parameters))
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
    .then(() => { return database.init(); })
    .then(() => { return initServer(); })
    .then(server => { return initSockets(server); })
    .catch(error => { 
        console.log(error);
        process.exit(6);
    })
    .done();
