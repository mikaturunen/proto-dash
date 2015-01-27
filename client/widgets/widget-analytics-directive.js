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

