
"use strict";

// starting the 'module' names with upper case to distinguish them from the rest
var Application = {
    name: "AnalyticsDashboard"
};

angular
    .module(Application.name, [
            // from bower or angular basic modules
            "ui.router", 
            "ui.bootstrap", 
            "btford.socket-io",
        ].concat(
            require("./dependency-mapping").map(function(angularModule) { return angularModule.name; })
        )
    )
    .config(require("./config/analytics-dashboard"));

console.log("Application bootstrapped");

module.exports = Application;
