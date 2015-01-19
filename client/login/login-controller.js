"use strict";

var name = "dash.login";
var dependencyMap = require("../dependency-map").add(name, [ "angular-google-gapi" ]);

var controller = function($rootScope, $scope, GAuth) {
    console.log("Creating login controller");
    
    $scope.login = function() {
        console.log("login woo");
        GAuth
            .login()
            .then(function() { console.log("YES"); })
            .catch(function() { console.log("NOPE"); });
    };
};
controller.$inject = [ "$rootScope", "$scope", "GAuth" ];
controller.controllerName = "LoginController";

var configuration = function($stateProvider) {
    $stateProvider.state("login", {
        templateUrl: "/public/html/login/login-view.html",
        url: "/",
        controller: controller
    });
}
configuration.$inject = [ "$stateProvider" ];

angular
    .module(name)
    .controller(controller.controllerName, controller)
    .config(configuration);

