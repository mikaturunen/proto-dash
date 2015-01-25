/* global gapi, console, require, angular, document */
/* jslint node: true */

"use strict";

var name = "dash.widgets";
var dependencyMap = require("../dependency-map").add(name);
var constants = require("../../server/utilities/constants");

var link = (scope, element, attributes) => {
    if (!(scope.isActive = scope.component.type === "IMAGE")) {
        return;
    }
};

var directive = () => {
    return {
        restrict: "E",
        scope: {
            component: "="
        },
        templateUrl: "/public/html/widgets/widget-image-template.html",
        link: link
    };
};
directive.directiveName = "widgetImage";

angular
    .module(name)
    .directive(directive.directiveName, directive);

