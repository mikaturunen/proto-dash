/* global gapi, console, require, angular, document, io */
/* jslint node: true */

"use strict";

var name = "dash.login";
var dependencyMap = require("../dependency-map").add(name, [ "dash.gapi" ]);
var Q = require("q");

var factory = function(gapi, $state) { 
    var redirect = function(state, redirectOnAuthorized) {
        var deferred = Q.defer();
        var redirectCallback = function() {
            $state.go(state);
            deferred.reject();
        };
        var stayOnCurrentCallback = function() {
            deferred.resolve();
        };

        gapi.isAuthorized()
            .done(
                redirectOnAuthorized ? redirectCallback : stayOnCurrentCallback, 
                redirectOnAuthorized ? stayOnCurrentCallback : redirectCallback
            );

        return deferred.promise;
    };
    
    return {
        redirect: redirect
    };
};
factory.$inject = [ "gapi", "$state" ];
factory.factoryName = "login-redirector";

angular
    .module(name)
    .factory(factory.factoryName, factory);