
"use strict";

//var angularBaseConfiguration = require("./config/analytics-dashboard");

var angularDependencyMapping = [
    // assumes that all the bootstrapping functions have .name and required functions for them to work with angular
  //  require("./dashboard-controllers/bootstrap")
];

/** 
 * Entry point for the application. Hotwires everything in place and basically makes sure the application is ready for
 * active use.
 */
var bootstrapApplication = function() {
    console.log("Application bootstrapped");
};

// starting the 'module' names with upper case to distinguish them from the rest
var Application = {
    bootstrap: bootstrapApplication
};

// start the application
Application.bootstrap();

module.exports = Application;
