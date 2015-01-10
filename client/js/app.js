
"use strict";

//var angularBaseConfiguration = require("./config/analytics-dashboard");

var angularDependencyMapping = [
    // assumes that all the bootstrapping functions have .name and required functions for them to work with angular    
    require("./dashboard-controllers/bootstrap"),
    require("./dashboard/bootstrap")
];

// starting the 'module' names with upper case to distinguish them from the rest
var Application = {
    name: "AnalyticsDashboard"
};

// start the application
var configuration = function($stateProvider, $urlRouterProvider, $locationProvider) {
    $urlRouterProvider.otherwise("/")
    // we want the fully functional html5 mode (also removes the # -sign from the URL)
    $locationProvider.html5Mode(true);

    // defining the used states -- can we survive with just one state for the dashboard?
    angularDependencyMapping.forEach(function(mapping) {
        if (!mapping.states) {
            console.log("Module", mapping.name, "does not provide routes for angular-ui-router");
            return;    
        }
       
        mapping.states.forEach(function(state) {
            console.log("State:", state.name, "options:", JSON.stringify(state.options));
            $stateProvider.state(state.name, state.options);
        });  
    });
};

configuration.$inject = [ "$stateProvider", "$urlRouterProvider", "$locationProvider" ];

angular
    .module(Application.name, [
            // from bower or angular basic modules
            "ui.router", 
            "ui.bootstrap", 
            "btford.socket-io",
        ].concat(
            angularDependencyMapping.map(function(angularModule) { return angularModule.name; })
        )
    )
    .config(configuration);

console.log("Application bootstrapped");

module.exports = Application;
