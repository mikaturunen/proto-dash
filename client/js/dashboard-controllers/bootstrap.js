
"use strict";

var name = "AnalyticsDashboard.UserDashboardControllers";

/** 
 * @module
 * Actual module that bootstraps the different (3 for now) user dashboard components into Angular by creating 
 * all required module, services and directives in one fell swoop.
 */
var UserDashbordControllerBootstrap = {
    /** 
     * {string} Name of the module, used to tell the main module what it depends on, main module depends on this module
     */ 
    name: name
};

// creating the module
angular.module(UserDashbordControllerBootstrap.name, [ ]);
        

module.exports = UserDashbordControllerBootstrap;
