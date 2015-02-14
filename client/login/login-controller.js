/* global gapi, console, require, angular, document */
/* jslint node: true */
/* jshint esnext: true */

"use strict";

var name = "dash.login";
var dependencyMap = require("../dependency-map").add(name, [ "dash.gapi" ]);

/** 
 * Login controller.
 */
var controller = ($rootScope, $scope, gapi, $state, $window) => {
    gapi.auth({ success: "dashboard" });
};
controller.$inject = [ "$rootScope", "$scope", "gapi", "$state", "$window" ];
controller.controllerName = "LoginController";

/** 
 * Login template configuration. Setting routes and urls.
 * @param {ngService} $stateProvider Angular state provider.
 */
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

