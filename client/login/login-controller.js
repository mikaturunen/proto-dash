/* global gapi, console, require, angular, document */
/* jslint node: true */

"use strict";

var name = "dash.login";
var dependencyMap = require("../dependency-map").add(name, [ "dash.gapi" ]);
var Q = require("q");

var controller = ($rootScope, $scope, gapi, $state) => {
    gapi.auth().done(() => { $state.go("dashboard"); });
};
controller.$inject = [ "$rootScope", "$scope", "gapi", "$state" ];
controller.controllerName = "LoginController";

var configuration = ($stateProvider) => {
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

