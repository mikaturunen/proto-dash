/* global gapi, console, require, angular, document */
/* jslint node: true */
/* jshint esnext: true */

"use strict";

// TODO comment the functions

var name = "dash.controllers";
var dependencyMap = require("../dependency-map").add(name);
var constants = require("../../server/utilities/constants");

var _ = require("lodash");

var controller = ($rootScope, $scope, socket, $state, gapi) => {   
    $scope.dashboards = [];
    $scope.dashboard = undefined;
    $scope.dashboardComponents = [];
    
    $scope.getComponentsForDashboard = dashboard => {
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

    var listeners = [{
        eventName: "dash.get.dashboard.empty",
        callback: () => { console.log("No dashboard available for user."); }
    }]
    .forEach(listener => {
        socket.on(listener.eventName, listener.callback);
    });
    
    $rootScope.$on('$stateChangeStart', (event, toState, toParams, fromState, fromParams) => {
        // TODO remove listeners from socket.
    });

    gapi.isAuthorized()
        .then(user => {
            console.log("authed:", user);
            $scope.getDashboards(user);
        })
        .catch(error => {
            // The user has not logged in
            console.log("Not logged in, sending to login screen.", error);
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

