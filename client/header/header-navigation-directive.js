/* global gapi, console, require, angular, document */
/* jslint node: true */
/* jshint esnext: true */

"use strict";

var name = "dash.header";
var dependencyMap = require("../dependency-map").add(name);

/** 
 * Linking function for Header directive.
 * @param {Object} scope the actual scope we are using for the directive
 * @param {Object} element main element that triggered the directive
 * @param {Object} attributes list of attributes for the element
 */
var link = (scope, element, attributes) => {
    console.log("dashboard");
    console.log("dashboards: " + scope.dashboards.lenght);
};

/** 
 * Directive for the header navigation
 */
var directive = () => {
    return {
        restrict: "E",
        scope: {
            dashboards: "=",
            logout: "=",
            select: "="
        },
        templateUrl: "/public/html/header/header-navigation-template.html",
        link: link
    };
};
directive.directiveName = "headerNavigation";

angular
    .module(name)
    .directive(directive.directiveName, directive);

