/* global gapi, console, require, angular, document, window */
/* jslint node: true */
/* jshint esnext: true */

"use strict";

var name = "dash.controllers";
var dependencyMap = require("../dependency-map").add(name);
var constants = require("../../server/utilities/constants");
var dashService = require("./dashboard-service");

var _ = require("lodash");

/**
 * Controller for angular that takes care of most of the Dashboard behavior.
 */
var controller = ($rootScope, $scope, $state, gapi, dashService, $q, $window) => {   
    $scope.dashboards = [];
    $scope.dashboard = undefined;
    $scope.userHasNoDashboards = false;
    $scope.dashboardComponents = [];
    $scope.getComponentsForDashboard = dashService.getComponentsForDashboard($scope);
    $scope.getDashboards = dashService.getDashboards($scope);
    $scope.logout = gapi.logout;

    /**
     * Selects a given dashboard into active use and fetches the components for the dashboard.
     * @param  {DashboardModel} dashboard Dashboard object
     */
    $scope.selectDashboard = dashboard => {
        $scope.getComponentsForDashboard(dashboard)
            .then(components => {
                // TODO store selection into local storage
                console.log("Wookie woo, selected new dashboard");
            })
            .catch(error => {
                console.log("Could not fetch dashboard");
                console.error(error);
            });
    };

    /**
     * After authorization starts working on getting all the required dashboards and information to the client.
     * @param  {string} user users email
     */
    var execute = user => {
        $scope
            .getDashboards(user)
            .then(dashboards => {
                var deferred = $q.defer();

                // TODO read selected dashboard from local storage and open based on it

                // Temp development time fix as the database might contain all sorts of old mush before clean up :)
                var index = _.findIndex(dashboards, (dash) => { return dash.rows_component_ids !== undefined; });

                if (dashboards.length > 0 && index !== -1) {
                    console.log("Received dashboards", JSON.stringify(dashboards));
                    $scope.getComponentsForDashboard(dashboards[index]).then(deferred.resolve, deferred.reject);
                } else {
                    deferred.reject(new Error("User has no dashboards.", 1));
                    $scope.userHasNoDashboards = true;
                }

                return deferred.promise;
            })
            .catch(error => {
                // TODO show some sort of error to the user about it
                $scope.dashboards = [ ];
                console.log("No dashboards available for user");
                console.error(error);
            });
    };

    gapi.auth().then(response => {
        console.log("response", response);
        gapi.isAuthorized()
            .then(response => {
                console.log("authed:", response, response.email);
                execute(response.email);
            })
            .catch(error => { 
                console.log("error", error); 
                // because we know GAPI misbehaves; we actually do a refresh to the front page instead of state.go to it
                $window.location.href = "/";
            });
    })
    .catch(error => {
        console.log("auth error", error);
        $window.location.href = "/";
    });
};
controller.$inject = [ "$rootScope", "$scope", "$state", "gapi", "dashboard-service", "$q", "$window" ];
controller.controllerName = "DashboardController";

/**
 * Configuration for angular-ui-router and how the controller hooks into it. Providing a single place of declaration.
 * @param  {ng-service} $stateProvider 
 */
var configuration = $stateProvider => {
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

