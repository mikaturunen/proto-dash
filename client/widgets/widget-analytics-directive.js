/* global gapi, console, require, angular, document */
/* jslint node: true */
/* jshint esnext: true */

"use strict";

var name = "dash.widgets";
var dependencyMap = require("../dependency-map").add(name);
var constants = require("../../server/utilities/constants");

/** 
 * Directive for Analytics Widget
 */
var directive = (gapiservice, $window, $timeout) => {
    var link = (scope, element, attributes) => {
        if (!(scope.isActive = scope.component.type === "GOOGLE_ANALYTICS")) {
            return;
        }
       
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
directive.$inject = [ "gapiservice", "$window", "$timeout" ];
directive.directiveName = "widgetAnalytics";

angular
    .module(name)
    .directive(directive.directiveName, directive);

