/* global gapi, console, require, angular, document */
/* jshint node: true */
/* jshint esnext: true */

"use strict";

require("./gapi/gapi-service");
require("./gapi/gapi");
require("./company/company-directive");
require("./login/login-controller");
require("./socket/socket-service");
require("./header/header-navigation-directive");
require("./footer/footer-navigation-directive");
require("./dashboard/dashboard-controller");
require("./widgets/widget-analytics-directive");
require("./widgets/widget-frame-directive");
require("./widgets/widget-image-directive");

var configuration = ($urlRouterProvider, $locationProvider) => {
    $locationProvider.html5Mode(true);
    $urlRouterProvider.otherwise("/");
};
configuration.$inject = [ "$urlRouterProvider", "$locationProvider" ];

angular
    .module("dash", [
            // from bower or angular basic modules
            "ui.router", 
            "ui.bootstrap",
            "ngCookies"
        ]
        .concat(require("./dependency-map").dependencies)
    )
    .config(configuration);

console.log("Application bootstrapped");

