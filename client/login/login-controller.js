/* global gapi, console, require, angular, document */

"use strict";

var name = "dash.login";
var dependencyMap = require("../dependency-map").add(name, [ "dash.gapi" ]);

var controller = function($rootScope, $scope, gapi) {
    console.log("Creating login controller");
    $scope.login = function() {
        gapi.auth();
    };
};
controller.$inject = [ "$rootScope", "$scope", "gapi"];
controller.controllerName = "LoginController";

var configuration = function($stateProvider) {
    $stateProvider.state("login", {
        templateUrl: "/public/html/login/login-view.html",
        url: "/",
        controller: controller
    });
}
configuration.$inject = [ "$stateProvider" ];

var run = function(gapi) {
    gapi.isAuthorized().then(function() {
        console.log("User is authorized. Moving to dashboard.");
       // state.go("dashboard");
    })
    .catch(function(error) {
        // TODO remove
        console.error("error " + error);
    });
};
run.$inject = [ "gapi" ];

angular    
    .module(name)
    .controller(controller.controllerName, controller)
    .config(configuration)
    .run(run);

