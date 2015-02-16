/* global gapi, console, require, angular, document, window, $ */
/* jslint node: true */
/* jshint esnext: true */

"use strict";

var name = "dash.widgets";
var dependencyMap = require("../dependency-map").add(name);
var constants = require("../../server/utilities/constants");

/** 
 * Angular directive for Iframe based widgets to show external content on the Dashboard.
 * @param  {ng-service} $sce
 */
var elementDirective = ($sce) => {
    // 6? don't ask me why.. I'll look into it later :D I need to find the element that produces this so I can dynamically
    // drop it out. For now this works and we need to move forward with the proto idea
    var missingHeight = 12;
    
    /**
     * Linker function for the direcvite.
     * @param  {ng-scope} scope     
     * @param  {HtmlElement} element    
     * @param  {Object} attributes 
     */
    var elementDirectiveLink = (scope, element, attributes) => {
        if (!(scope.isActive = scope.component.type === "IFRAME")) {
            return;
        }

        scope.dynamicResize = () => {
            console.log("Resizing the iframe to fill container..", element);
            $(element).find("iframe").iFrameResize();
        };

        scope.component.source = $sce.trustAsResourceUrl(scope.component.source);
    };

    return {
        restrict: "E",
        scope: {
            component: "="
        },
        templateUrl: "/public/html/widgets/widget-frame-template.html",
        link: elementDirectiveLink
    };
};
elementDirective.$inject = [ "$sce" ];
elementDirective.directiveName = "widgetFrame";

// There is no direct way of binding angular to elements onload event (as javascript elements onload callback looks into
// window.callback (global function scope)) and angular is extremely finicky with that and it does not work with the 
// common way of thinking with angular. To avoid the issue we create simple angular directive that just takes care 
// of the onload ballback of the iframe element and this way we get nicely wrapped onload functionality in angular :)

/**
 * Creates a angular scope bound callback to allow easier angular style callbacks into specific elements onload callback
 * through the custom 'element-onload' attribute.
 * 
 * Solves case:
 *     <iframe src="www.google.com" onload="callbackGlobalFunction()"></iframe>
 *     
 * Example usage:
 *     <iframe src="www.google.com" element-onload="angularScopeCallback()"></iframe>
 */
var elementOnloadDirective = () => {
    return {
        restrict: "A",
        scope: {
            callback: "&elementOnload"
        },
        link: (scope, element, attrs) => {
            // hooking up the onload event
            element.on("load", () => scope.callback());
        }
    };
};
elementOnloadDirective.$inject = [ ];
elementOnloadDirective.directiveName = "elementOnload";

angular
    .module(name)
    .directive(elementOnloadDirective.directiveName, elementOnloadDirective)
    .directive(elementDirective.directiveName, elementDirective);

