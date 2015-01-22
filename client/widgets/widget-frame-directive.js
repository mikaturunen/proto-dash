/* global gapi, console, require, angular, document */
/* jslint node: true */

"use strict";

var name = "dash.widgets";
var dependencyMap = require("../dependency-map").add(name);
var constants = require("../../server/utilities/constants");

var link = function($sce) {
    return function(scope, element, attributes) {
        if (!(scope.isActive = scope.component.type === "IFRAME")) {
            return;
        }

        if (scope.component.source.indexOf("docs.google.com") !== -1 && 
            scope.component.source.slice(-13) !== "&output=embed") {
            // TODO fix the if statement and apply for a proper embed option
        }
        
        var url = (scope.component.source + "&embedded=true");
      
        scope.component.source = $sce.trustAsResourceUrl(url);
        console.log("widgetAnalytics working.", url);
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

