"use strict";

require("./dashboard/controller");
require("./socket/service");

/**
 * Configuration block for angular module "AnalyticsDashboard"
 */
var configuration = function($stateProvider, $urlRouterProvider, $locationProvider) {
    $urlRouterProvider.otherwise("/")
    // we want the fully functional html5 mode (also removes the # -sign from the URL)
    $locationProvider.html5Mode(true);
};
configuration.$inject = [ "$stateProvider", "$urlRouterProvider", "$locationProvider" ];

angular
    .module("AnalyticsDashboard", [
            // from bower or angular basic modules
            "ui.router", 
            "ui.bootstrap", 
            "btford.socket-io",
        ].concat(
            require("./dependency-map").listDependencies
        )
    )
    .config(configuration);

console.log("Application bootstrapped");
