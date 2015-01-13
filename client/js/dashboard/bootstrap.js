"use strict";

var name = "AnalyticsDashboard.DashboardControllers";

var dependencies = [
    require("./controller")
];

// states we are giving to angular-ui-router for routing purposes 
var states = dependencies.map(function(moduleDependency) {
    // set of properties the angular-ui-router directly uses
    return {
        name: moduleDependency.name,
        options: {
            url: moduleDependency.url,
            templateUrl: moduleDependency.templateUrl,
            controller: moduleDependency.name
        }
    }
});

/** 
 * @module
 * Actual module that bootstraps the main dashboard into place. The view controller itself. The user controllers are 
 * then operated inside the dashboard itself.
 */
var DashbordControllerBootstrap = {
    /** 
     * Name of the module, used to tell the main module what it depends on, main module depends on this module
     */ 
    name: name,
    
    /** 
     * {any[]} Tells angular-ui-router what states are available in from this controller
     */
    states: states
};

// after this module is created, we can start connecting the differet controllers, directives and services to it
angular.module(DashbordControllerBootstrap.name, [ ]);
dependencies.forEach(function(dependency) { dependency.bootstrap(DashbordControllerBootstrap.name); });

module.exports = DashbordControllerBootstrap;
