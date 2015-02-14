/* global gapi, console, require, angular, document, window */
/* jslint node: true */
/* jshint esnext: true */

"use strict";

var name = "dash.controllers";
var dependencyMap = require("../dependency-map").add(name);
var directive = require("./widget-analytics-directive");

var _ = require("lodash");

/** 
 * Controller for Analytics Widget
 */
var controller = ($rootScope, $scope, $window, $timeout) => {   
    $scope.opened = false;
    $scope.open = () => {
        $timeout(() => {
            $scope.opened = true;
        });
   };
    
    $scope.openedEnd = false;
    $scope.openEnd = () => {
        $timeout(() => {
            $scope.opened = true;
        });
   };
    
    // TODO design a solution to use the 30daysago etc dynamic values from gapi on the calendar
    if ($scope.component.gapi &&  $scope.component.gapi.query) {            
        $scope.startDate = $window.moment($scope.component.gapi.query["start-date"], "YYYY-MM-DD");
        $scope.endDate = $window.moment($scope.component.gapi.query["end-date"], "YYYY-MM-DD");
    }

    //- TODO Save the values into the database when user selects something

    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };

};
controller.$inject = [ "$rootScope", "$scope", "$window", "$timeout" ];
controller.controllerName = "WidgetAnalyticsController";

angular
    .module(name)
    .controller(controller.controllerName, controller);
