"use strict";

var name = "dash.controllers";
var dependencyMap = require("../dependency-map").add(name);

var controller = function($scope) {
    console.log("CREATED");
};
controller.$inject = [ "$scope", "socket" ];
controller.controllerName = "DashboardController";

var stateName = "dashboard";
var stateOptions = {
    templateUrl: "/public/html/dashboard.html",
    url: "/",
    controller: controller
};

var configuration = function($stateProvider) {
    $stateProvider.state(stateName, stateOptions);
}
configuration.$inject = [ "$stateProvider" ];

angular
    .module(name)
    .controller(controller.controllerName, controller)
    .config(configuration);

