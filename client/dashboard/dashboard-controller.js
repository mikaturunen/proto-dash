/* global gapi, console, require, angular, document */
"use strict";

var name = "dash.controllers";
var dependencyMap = require("../dependency-map").add(name);
var constants = require("../../server/utilities/constants");

var _ = require("lodash");

var controller = function($scope, socket) {
    $scope.dashboards = [];
    $scope.dashboard = undefined;
    $scope.dashboardComponents = [];
    
    $scope.getComponentsForDashboard = function(dashboard) {
        if (dashboard === undefined) {
            console.error("No dashboard provided. Cannot fetch components for board that is not present.");
            return;
        }
        
        // set active dashboard
        $scope.dashboard = dashboard;
        // fetch components for the dashboard
        socket.emit(
            "dash.get.dashboard.components", 
            dashboard.rows_component_ids, 
            function(socket, resultingComponents) {
                console.log("Components for Active dashboard", resultingComponents);
                // backend sorts and makes sure the resulting components are already ready for use
                $scope.dashboardComponents = resultingComponents;
            });   
    };
    
    $scope.getDashboards = function() {
        socket.emit("dash.get.dashboard", {}, function(socket, result) {    
            $scope.dashboards = result;

            if ($scope.dashboards.length > 0) {
                $scope.getComponentsForDashboard($scope.dashboards[0]);
            }
        });
    };
    
   $scope.getDashboards();
};
controller.$inject = [ "$scope", "socket" ];
controller.controllerName = "DashboardController";

var configuration = function($stateProvider) {
    $stateProvider.state("dashboard", {
        templateUrl: "/public/html/dashboard/dashboard-view.html",
        url: "/dashboard",
        controller: controller
    });
}
configuration.$inject = [ "$stateProvider" ];

angular
    .module(name)
    .controller(controller.controllerName, controller)
    .config(configuration);

