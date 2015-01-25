/* global gapi, console, require, angular, document */
/* jslint node: true */

"use strict";

var name = "dash.controllers";
var dependencyMap = require("../dependency-map").add(name);
var constants = require("../../server/utilities/constants");

var _ = require("lodash");

var controller = ($rootScope, $scope, socket, $state, gapi) => {   
    $scope.dashboards = [];
    $scope.dashboard = undefined;
    $scope.dashboardComponents = [];
    
    $scope.getComponentsForDashboard = (dashboard) => {
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
            (socket, resultingComponents) => {
                console.log("Components for Active dashboard", resultingComponents);
                // backend sorts and makes sure the resulting components are already ready for use
                $scope.dashboardComponents = resultingComponents;
            });   
    };

    $scope.getDashboards = user => {
        socket.emit("dash.get.dashboard", user, (socket, result) => {    
            $scope.dashboards = result;

            if ($scope.dashboards.length > 0) {
                $scope.getComponentsForDashboard($scope.dashboards[0]);
            }
        });
    };

    var removeEmptyListener = socket.on("dash.get.dashboard.empty", () => {
        // TODO show message to the user that they should contact their contact person about this
        console.log("No dashboards available for user");
    });
    
    $rootScope.$on('$stateChangeStart', (event, toState, toParams, fromState, fromParams) => {
        console.log("Removing socket.on listeners..");
        removeEmptyListener();
    });

    gapi.isAuthorized()
        .done(user => {
            console.log("authed:", user);
            $scope.getDashboards(user);
        },
        error => {
            // The user has not logged in
            $state.go("login");
        });
};
controller.$inject = [ "$rootScope", "$scope", "socket", "$state", "gapi" ];
controller.controllerName = "DashboardController";

var configuration = ($stateProvider) => {
    $stateProvider.state("dashboard", {
        templateUrl: "/public/html/dashboard/dashboard-view.html",
        url: "/dashboard",
        controller: controller
    });
};
configuration.$inject = [ "$stateProvider" ];

angular
    .module(name)
    .controller(controller.controllerName, controller)
    .config(configuration);

