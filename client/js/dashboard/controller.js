"use strict";

/** 
 * Controller function that will be used by angular
 */
var controller = function($scope) {
    console.log("Controller", DashboardController.name, "created.");
};
// because of minification we'll inject our dependnencies into the controller
controller.$inject = [ "$scope" ];

/** 
 * Bootstrapping function that initializes the controller into angular.
 * @param {string} parentModule - Name of the module this controller belongs to
 */ 
var bootstrap = function(parentModule) {    
    angular
        .module(parentModule)
        .controller(DashboardController.controller);
};

/** 
 * @module DashboardController
 */
var DashboardController = {
    /** 
     * Name of the controller and at the same time name of the state it'll be attached to. 
     */
    name: "dashboard",
    
    /** 
     * What url the state routes to
     */
    url: "/",
    
    /** 
     * What template is used with this controller
     */
    templateUrl: "public/html/dashboard.html",
    
    bootstrap: bootstrap,
                   
    controller: controller
};

module.exports = DashboardController;
