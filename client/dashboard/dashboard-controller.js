"use strict";

var name = "dash.controllers";
var dependencyMap = require("../dependency-map").add(name);
var constants = require("../../server/utilities/constants");

var _ = require("lodash");

var controller = function($scope, socket) {
    $scope.allDashboards = [];
    $scope.allComponents = [];
    
    $scope.dashboard = undefined;
    $scope.components = [];
    
    socket.emit("dash.get.dashboard", {}, function(socket, result) {    
        $scope.allDashboards = result.dashboards;
        $scope.allComponents = result.components; 
        
        if ($scope.allDashboards.length > 0) {
            // just select first from the set
            $scope.dashboard = $scope.allDashboards[0];
            // collect the included components into the active set
            var component_ids = [];
            $scope.dashboard.rows.forEach(function(row) {
                Object.keys(row).forEach(function(key) {
                    component_ids.push(row[key].component_id);
                });
            });
            
            // find all the components that match the id's
            $scope.components = _.where($scope.allComponents, function(component) {
                return component_ids.indexOf(component._id) !== -1;
            });
            
            console.log("Visible components:", $scope.components);
        }
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

