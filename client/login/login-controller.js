/* global gapi, console, require, angular, document */
/* jslint node: true */

"use strict";

var name = "dash.login";
var dependencyMap = require("../dependency-map").add(name, [ "dash.gapi" ]);
var Q = require("q");

var controller = function($rootScope, $scope, gapi, $state) {
    console.log("Creating login controller");
    
    gapi.auth().done(function() { console.log("go dash"); $state.go("dashboard"); }, function(error) { console.log(error); });
};
controller.$inject = [ "$rootScope", "$scope", "gapi", "$state" ];
controller.controllerName = "LoginController";

var configuration = function($stateProvider) {
    $stateProvider.state("login", {
        templateUrl: "/public/html/login/login-view.html",
        url: "/",
        controller: controller,
    });
};
configuration.$inject = [ "$stateProvider" ];

angular    
    .module(name)
    .controller(controller.controllerName, controller)
    .config(configuration);

