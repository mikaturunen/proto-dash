/* global console, require, __dirname, process, module */
/* jshint node: true */
/* jshint esnext: true */

var socket = require("socket.io");
var database = require("./database/database");
var Q = require("q");
var io;

/**
 * Initializes the socket.io server.
 * @param {Object} server - Server object from Express to connect the IO with.
 */
var initializeSocket = (server) => {
     io = socket(server);
};

/** 
 * Hooks all the required socket events into Socket.io clients.
 * @returns {Q.Promise<boolean>} Resolves to boolean truen on success. Rejects with error message.
 */
var hookSocketMessages = () => {
    var deferred = Q.defer();
    if (!io) {
        deferred.reject("No socket connection present. Call initializeSocket first!");
        return deferred.promise;
    }
    
   io.on(constants.events.socket.connected, socket => {
        console.log("Socket connected to server.", socket.id);

        socket.on("dash.get.dashboard", (parameters, resultHandler) => {
            console.log("Received socket get.dasboard");
            database
                .findDashboardsForEmail(parameters)
                .then(results => resultHandler(null, !results || results.length <= 0 ? [] : results))
                .catch(error => resultHandler(error))
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
                .then(results => resultHandler(null, results))
                .catch(error => resultHandler(error))
                .done();
        });

        socket.on(constants.events.socket.disconnected, () => {
            console.log("Socket disconnected from server.", socket.id);
        });
    });  
    
    deferred.resolve(io);

    return deferred.promise;
};

/** 
 * @module socket
 * Module for connecting all the socket server/clients together and attaching the events to it
 */
module.exports = {
    init: initializeSocket,
    hookSocketMessages: hookSocketMessages
};