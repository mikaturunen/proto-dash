/* global gapi, console, require, angular, document */
/* jslint node: true */
/* jshint esnext: true */

"use strict";

var name = "dash.footer";
var dependencyMap = require("../dependency-map").add(name);

var link = (scope, element, attributes) => {
};

/** 
 * Directive for the Footer template.
 */ 
var directive = () => {
    return {
        restrict: "E",
        scope: {
            dashboard: "="
        },
        templateUrl: "/public/html/footer/footer-navigation-template.html",
        link: link
    };
};
directive.directiveName = "footerNavigation";

angular
    .module(name)
    .directive(directive.directiveName, directive);

