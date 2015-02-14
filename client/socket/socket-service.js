/* global gapi, console, require, angular, document, io */
/* jslint node: true */
/* jshint esnext: true */

"use strict";

var name = "dash.socket";
var dependencyMap = require("../dependency-map").add(name);

/** 
 * Factory for WebSocket events.
 * Allows emitting and listening for events.
 */
var factory = ($rootScope) => {
    var socket = io.connect();
    
    return {
        /** 
         * On -event function for socket events.
         * @param {string} eventName Name of the event to listen for
         * @param {Function} Callback to trigger once the event fires.
         */
        on: (eventName, callback) => {
            socket.on(eventName, function () {  
                var args = arguments;
                
                // NOTE this is same behavior what $http does on XHR reply -> gets angular to update it's views properly
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        },
        
         /** 
         * event -event function for socket events.
         * @param {string} eventName Name of the event to send.
         * @param {Object} data What is being sent to server.
         * @param {Function} callback Potential callback the server might trigger
         */
        emit: function (eventName, data, callback) {
            console.log("socket-service.emit", eventName, data, callback);
            
            socket.emit(eventName, data, function () {
                var args = arguments;
                
                // NOTE this is same behavior what $http does on XHR reply -> gets angular to update it's views properly
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            });
        }
    };
};
factory.$inject = [ "$rootScope" ];
factory.factoryName = "socket";

angular
    .module(name)
    .factory(factory.factoryName, factory);