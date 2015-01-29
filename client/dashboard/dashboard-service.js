/* global gapi, console, require, angular, document */
/* jslint node: true */
/* jshint esnext: true */

"use strict";

var name = "dash.controllers.service";
var dependencyMap = require("../dependency-map").add(name);
var constants = require("../../server/utilities/constants");

/** 
 * Service that has abstracted simple behavior and communication from the dashboard controller to the service.
 * Allowed to manipulate the controllers scope as this is specific service for that controller.
 * @param  {ng-service} $q 
 */
var service = ($q, socket) => {
    /**
     * Gets all dashboards for the active users. 
     * @param  {$scope} $scope Dashboard-controllers active $scope object.
     * @return {(user) => Promise} Function that can be called with the user to get dashboards
     */
    var getDashboards = ($scope) => {
        return (user) => {
            var deferred = $q.defer();

            socket.emit("dash.get.dashboard", user, (socket, result) => {    
                $scope.dashboards = result;
                deferred.resolve(result);
            });

            return deferred.promise;
        };
    };

    /**
     * Gets components for selected dashboard.
     * @param  {$scope} $scope Dashboard-controllers active $scope object.
     * @return {(dashboard) => Promise} Function that can be called with the active dashboard to receive all dashboards
     */
    var getComponentsForDashboard = ($scope) => { 
        return (dashboard)  => {
            var deferred = $q.defer();

            if (dashboard === undefined) {
                console.error("No dashboard provided. Cannot fetch components for board that is not present.");
                deferred.reject("No dashboards provided");
                return deferred.promise;
            }
            
            // set active dashboard
            $scope.dashboard = dashboard;
            console.log("Dashboard selected:", JSON.stringify(dashboard, null, 2));
            
            // fetch components for the dashboard
            socket.emit(
                "dash.get.dashboard.components", 
                dashboard.rows_component_ids, 
                (socket, resultingComponents) => {
                    console.log("Components for Active dashboard", resultingComponents);
                    // backend sorts and makes sure the resulting components are already ready for use
                    $scope.dashboardComponents = resultingComponents;
                    deferred.resolve(resultingComponents);
                });   

            return deferred.promise;
        };
    };

    /**
     * The actual service we are returning
     */
    return {
        getDashboards: getDashboards,
        getComponentsForDashboard : getComponentsForDashboard
    };
};
service.$inject = [ "$q", "socket" ];
service.serviceName = "dashboard-service";

angular
    .module(name)
    .service(service.serviceName, service);
