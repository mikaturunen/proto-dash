/* global gapi, console, require, angular, document */
/* jslint node: true */

"use strict";

var name = "dash.login";
var dependencyMap = require("../dependency-map").add(name, [ "dash.gapi" ]);

var resolve = function(redirector) {
    // when user is authorized to googles services, we redirect to dashboard
    console.log("resolving login");
    return ""; //redirector.redirect("dashboard", true);
    
};
resolve.$inject = [ "login-redirector" ];

var controller = function($rootScope, $scope, gapi, $state) {
    console.log("Creating login controller");
    
    $scope.login = function() {
        gapi
            .auth()
            .done(function() {
                console.log("Forwarding to dashboard");
                $state.go("dashboard");
            });
    };
};
controller.$inject = [ "$rootScope", "$scope", "gapi", "$state" ];
controller.controllerName = "LoginController";

var configuration = function($stateProvider) {
    $stateProvider.state("login", {
        templateUrl: "/public/html/login/login-view.html",
        url: "/",
        controller: controller,
        resolve: {
            authorized: resolve
        }
    });
};
configuration.$inject = [ "$stateProvider" ];

angular    
    .module(name)
    .controller(controller.controllerName, controller)
    .config(configuration);

