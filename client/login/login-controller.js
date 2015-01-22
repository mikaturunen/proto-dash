/* global gapi, console, require, angular, document */
/* jslint node: true */

"use strict";

var name = "dash.login";
var dependencyMap = require("../dependency-map").add(name, [ "dash.gapi" ]);

var run = function(gapi, $state) {
    gapi.isAuthorized()
        .then(function() {
            console.log("User is authorized. Moving to dashboard.");
            $state.go("dashboard");
        })
        .catch(function() {
             console.log("User not logged in. Requires logging in.");   
        })
        .done();
};
run.$inject = [ "gapi", "$state" ];

var controller = function($rootScope, $scope, gapi, $state) {
    console.log("Creating login controller");
    run(gapi, $state);
    
    $scope.login = function() {
        gapi
            .auth()
            .then(function() {
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
        controller: controller
    });
};
configuration.$inject = [ "$stateProvider" ];

angular    
    .module(name)
    .controller(controller.controllerName, controller)
    .config(configuration);

