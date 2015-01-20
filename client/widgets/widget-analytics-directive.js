/* global gapi, console, require, angular, document */
"use strict";

var name = "dash.widgets";
var dependencyMap = require("../dependency-map").add(name);
var constants = require("../../server/utilities/constants");

var link = function(scope, element, attributes) {
    if (!(scope.isActive = scope.component.type === "GOOGLE_ANALYTICS")) {
        return;
    }
    
    console.log("widgetAnalytics working.");
};

var directive = function() {
    return {
        restrict: "E",
        scope: {
            component: "="
        },
        templateUrl: "/public/html/widgets/widget-analytics-template.html",
        link: link
    };
};
directive.directiveName = "widgetAnalytics";

angular
    .module(name)
    .directive(directive.directiveName, directive);

