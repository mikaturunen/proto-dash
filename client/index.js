"use strict";

require("./socket/socket-service");
require("./dashboard/dashboard-controller");

var configuration = function($urlRouterProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
    $urlRouterProvider.otherwise("/");
}
configuration.$inject = [ "$urlRouterProvider", "$locationProvider" ];

angular
    .module("dash", [
            // from bower or angular basic modules
            "ui.router", 
            "ui.bootstrap"
        ]
        .concat(require("./dependency-map").dependencies)
    )
    .config(configuration);

console.log("Application bootstrapped");

