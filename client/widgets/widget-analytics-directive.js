/* global gapi, console, require, angular, document */
/* jslint node: true */
/* jshint esnext: true */

"use strict";

var name = "dash.widgets";
var dependencyMap = require("../dependency-map").add(name);
var constants = require("../../server/utilities/constants");

var directive = (gapiservice) => {
    var link = (scope, element, attributes) => {
        if (!(scope.isActive = scope.component.type === "GOOGLE_ANALYTICS")) {
            return;
        }
    
        /** 
         * Generalized open popup method that can accept different scope variables to
         * be modified on opening of the function.
         * @param {Object} scope Directive scope.
         * @param {string} variable String name of the property to modify in the scope.
         * @returns {Function} Callback for the open event.
         */
        var open = (scope, variable) => {
              scope[variable] = false;
            
              /**
               * Opens the popup for the datepicker.
               * @param {Object} $event Angular wrapped event object.
               */
              return ($event) => {
                  console.log("Opening popup..");
                  $event.preventDefault();
                  $event.stopPropagation();
                  
                  scope[variable] = true;
              }; 
        };
        
        //- TODO Read the values from database
        //- TODO Save the values into the database when user selects something
        scope.startDate = new Date();
        scope.endDate = new Date();
       
        scope.dateOptions = {
           formatYear: 'yy',
           startingDay: 1
        };
        scope.openStart = open(scope, "startOpened");
        scope.openEnd = open(scope, "endOpened");

        gapiservice.generate(scope.component.gapi);
    };

    return {
        restrict: "E",
        scope: {
            component: "="
        },
        templateUrl: "/public/html/widgets/widget-analytics-template.html",
        link: link
    };
};
directive.$inject = [ "gapiservice" ];
directive.directiveName = "widgetAnalytics";

angular
    .module(name)
    .directive(directive.directiveName, directive);

