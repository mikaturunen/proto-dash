"use strict";

/** 
 * List of AnalyticsDashboard module dependencies that can be injected where they are needed the most.
 * Mainly when setting up the high-level angular main application AnalyticsDashboard and route creation
 * for angular-ui-router
 */
var dependencyMapping = [
    require("./dashboard/bootstrap"),
    require("./dashboard-controllers/bootstrap")
];

module.exports = dependencyMapping;