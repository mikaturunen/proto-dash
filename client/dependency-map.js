/* global gapi, console, require, angular, document */
/* jshint node: true */
/* jshint esnext: true */

"use strict";

// Dynamically loads all the specified dependencies into Angulars context and allows easier injection into the scope
// from a centralized location

var dependencies = [ ];
module.exports = {
    /** 
     * {Array<string>} List of dependencies for Angular to include into the main module of the application.
     */
    dependencies: dependencies,
    
    /** 
     * Adds a new dependency to Angular
     * @param {string} dependency Name of the dependency
     * @param {Array<string>} dependsOn (Optional) List of dependencies the angular module might depend on. 
     */
    add: function(dependency, dependsOn) {
        if (dependencies.indexOf(dependency) !== -1) {
            return;
        }
        
        dependsOn = dependsOn || [ ];
        dependencies.push(dependency);
        
        // Tell angular we want to create a new module
        console.log("Creating module", dependency, "that depends on", dependsOn);
        angular.module(dependency, dependsOn);
    }
};