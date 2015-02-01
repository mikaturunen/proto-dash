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
            window.foobar = element;
            
            // IDEA behind the calculation: dynamically stretch the iframe to match containing div.
            //    The widget is made of three elements, top title element, widget container (the iframe in this case)
            //    and a span element for caption if the user so wishes. I need to supstract the size of the title + caption
            //    from the whole size of the widget (the container with the three elements in) to get the size for the
            //    widget div (iframe) and then apply that..
            
            var elements  = element.children()[0];
            var divHeight = $(elements).outerHeight(true)  - 
                (
                    $(elements.children[0].children).outerHeight(true) +
                    $(elements.children[2]).outerHeight(true) + missingHeight
                );
            
            var outer = $(elements.children[1].children).outerHeight(true);
            var inner =  $(elements.children[1].children).height();
            var difference = outer - inner;
            var iframeHeight = divHeight - difference;
            
            console.log("Calculated max div height is: " + divHeight);
            console.log("IFrame outer - inner = difference. ", outer, " - ", inner, " = ", difference);
            console.log("divHeight - difference = Iframe size. ", divHeight, " - ", difference, " = ", iframeHeight);
                        
            // Setting the iframe containing div height 
            // $(elements.children[1]).height(divHeight);
            // Now setting the iframe height to grow into the div... this is absolutely idiotic.
            // We calculate the difference between the outerHeight and the innerHeight (borders, margings, etc)
            // TODO look into more reasonable CSS solution instead of mad javascript trickery, this is idiotic.
            $(elements.children[1].children).height(iframeHeight);
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

