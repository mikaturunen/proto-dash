"use strict";

var name = "dash.widgets";
var dependencyMap = require("../dependency-map").add(name);
var constants = require("../../server/utilities/constants");

var directive = function() {
    return {
        restrict: "E",
        scope: {
            component: "="
        },
        templateUrl: "/public/html/widgets/widget-frame-template.html"
    };
};
directive.directiveName = "WidgetFrame";

angular
    .module(name)
    .controller(directive.directiveName, directive);

