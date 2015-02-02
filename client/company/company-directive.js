/* global gapi, console, require, angular, document */
/* jslint node: true */
/* jshint esnext: true */

"use strict";

/**
 * The advert directive for joining the service. When the user logs into the service they are shown the "advert" 
 * dashboard which simply just points the user to contact the company/service provider
 */

var name = "dash.company";
var dependencyMap = require("../dependency-map").add(name);

var link = (scope, element, attributes) => {
};

var directive = () => {
    return {
        restrict: "E",
        templateUrl: "/public/html/company/company-template.html",
        link: link
    };
};
directive.directiveName = "company";

angular
    .module(name)
    .directive(directive.directiveName, directive);

