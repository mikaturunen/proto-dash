"use strict";

var name = "dash.controllers";
var dependencyMap = require("../dependency-map").add(name);
var constants = require("../../server/utilities/constants")


var controller = function($scope, socket) {
    console.log("CREATED");
    
    socket.emit("dash.get.dashboard", {}, function(result) {
        console.log("JSON dashboard", JSON.stringify(result));
    });
};
controller.$inject = [ "$scope", "socket" ];
controller.controllerName = "DashboardController";

var stateName = "dashboard";
var stateOptions = {
    templateUrl: "/public/html/dashboard/dashboard-view.html",
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

