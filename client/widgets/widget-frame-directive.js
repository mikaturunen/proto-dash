"use strict";

var name = "dash.widgets";
var dependencyMap = require("../dependency-map").add(name);
var constants = require("../../server/utilities/constants");

var link = function($sce) {
    return function(scope, element, attributes) {
        if (!(scope.isActive = scope.component.type === "IFRAME")) {
            return;
        }

        scope.component.source = $sce.trustAsResourceUrl(scope.component.source);
        console.log("widgetAnalytics working.");
    };
};

var directive = function($sce) {
    return {
        restrict: "E",
        scope: {
            component: "="
        },
        templateUrl: "/public/html/widgets/widget-frame-template.html",
        link: link($sce)
    };
};
directive.$inject = [ "$sce" ];
directive.directiveName = "widgetFrame";

angular
    .module(name)
    .directive(directive.directiveName, directive);

