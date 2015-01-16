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
        templateUrl: "/public/html/widgets/widget-image-template.html"
    };
};
directive.directiveName = "WidgetImage";

angular
    .module(name)
    .controller(directive.directiveName, directive);

