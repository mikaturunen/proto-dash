"use strict";

/**
 * Configuration block for angular module "AnalyticsDashboard"
 */
var configuration = function($stateProvider, $urlRouterProvider, $locationProvider) {
    $urlRouterProvider.otherwise("/")
    // we want the fully functional html5 mode (also removes the # -sign from the URL)
    $locationProvider.html5Mode(true);

    // defining the used states -- can we survive with just one state for the dashboard?
    require("../dependency-mapping").forEach(function(mapping) {
        if (!mapping.states) {
            console.log("Module", mapping.name, "does not provide routes for angular-ui-router");
            return;    
        }
       
        // Modules that have the .states in place are going to get hotwired to angular-ui-routes 
        mapping.states.forEach(function(state) {
            console.log("State:", state.name, "options:", JSON.stringify(state.options));
            $stateProvider.state(state.name, state.options);
        });  
    });
};

configuration.$inject = [ "$stateProvider", "$urlRouterProvider", "$locationProvider" ];

module.exports = configuration;