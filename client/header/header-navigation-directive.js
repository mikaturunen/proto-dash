/* global gapi, console, require, angular, document */
/* jslint node: true */
/* jshint esnext: true */

"use strict";

var name = "dash.header";
var dependencyMap = require("../dependency-map").add(name);

var link = (scope, element, attributes) => {
    console.log("dashboard");
    console.log("dashboards: " + scope.dashboards.lenght);
};

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

