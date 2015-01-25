/* global gapi, console, require, angular, document, io */
/* jslint node: true */
/* jshint esnext: true */

"use strict";

var name = "dash.socket";
var dependencyMap = require("../dependency-map").add(name);

var factory = ($rootScope) => {
    var socket = io.connect();
    
    return {
        on: (eventName, callback) => {
            socket.on(eventName, function () {  
                var args = arguments;
                
                // NOTE this is same behavior what $http does on XHR reply -> gets angular to update it's views properly
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        },
        
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