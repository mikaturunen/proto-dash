"use strict";

var dependencies = [];

module.exports = {
    add: function(name) {
        if (dependencies.indexOf(name) !== -1) {
            return
        }
        
        dependencies.push(name);
    },
    
    listDependencies: dependencies
};