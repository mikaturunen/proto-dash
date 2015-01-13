"use strict";

var name = "Dashboard";
var moduleName = "AnalyticsDashboard.DashboardControllers";

require("../dependency-map").add(moduleName);

/** 
 * Controller function that will be used by angular
 */
var controller = function($scope) {
    console.log("Controller", name, "created.");
};
// because of minification we'll inject our dependencies into the controller
controller.$inject = [ "$scope" ];

var stateName = "dashboard";
var stateOptions = {
    url: "/",
    templateUrl: "public/html/dashboard.html",
    controller: controller
};

var configuration = function($stateProvider) {
    console.log("Controller", name, "setting states." , JSON.stringify(stateOptions));
    $stateProvider.state(stateName, stateOptions);
};
configuration.$inject = [ "$stateProvider", "$urlRouterProvider", "$locationProvider" ];
               
angular
    .module(moduleName, [ "ui.router" ])
    .controller(name + "Controller", controller)
    .config(configuration);
