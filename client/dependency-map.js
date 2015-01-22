/* global gapi, console, require, angular, document */
/* jshint node: true */
"use strict";

var dependencies = [ ];
module.exports = {
    dependencies: dependencies,
    
    /** 
     * Adds a new dependency to Angular
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