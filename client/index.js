"use strict";

require("./login/login-controller");
require("./socket/socket-service");
require("./dashboard/dashboard-controller");
require("./widgets/widget-analytics-directive");
require("./widgets/widget-frame-directive");
require("./widgets/widget-image-directive");

var configuration = function($urlRouterProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
    $urlRouterProvider.otherwise("/");
};
configuration.$inject = [ "$urlRouterProvider", "$locationProvider" ];

angular
    .module("dash", [
            // from bower or angular basic modules
            "ngAnalytics",
            "ui.router", 
            "ui.bootstrap",
            "angular-google-gapi"
        ]
        .concat(require("./dependency-map").dependencies)
    )
    .run(['GAuth', 'GApi', '$state', function(GAuth, GApi, $state) {
        //GApi.load('myApiName','v1')
        GAuth.setClient("182467596451-qubeiec3osp7iqhuqqp4sb3jrdgpk8ah.apps.googleusercontent.com");
    }])
    .config(configuration);

console.log("Application bootstrapped");

