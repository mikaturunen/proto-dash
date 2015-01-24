/* global console, require, __dirname, process, module */
/* jslint node: true */

var Q = require("q");
var fs = require("fs");
var path = require("path");

// I could write fs.exists, go through the hassle of checking it and all but I thought I'd just do it this way for now,
// potential refactor target in the near future.
var config;
try {
    config = require("./config.json");
} catch (error) {
    // File not found, digest error and create dummy!
    // We can safely assume that when there are no configuration file in place, we use environment variables
    config = { };
    console.log("Configuration not found - using environment values");
}

/** 
 * Selects a value: either left-hand side or right-hand side. When LHS is undefined or "" it's skipped and RHG is used.
 */
var selectValue = function(lhs, rhs) {
    if (lhs !== undefined && lhs.trim() !== "") {
        return lhs;
    }
    return rhs;
};

var configuration = {
    databaseUser:     selectValue(process.env.DATABASE_USER, config.databaseUser),
    databasePassword: selectValue(process.env.DATABASE_PASSWORD, config.databasePassword),
    databaseUrl:      selectValue(process.env.DATABASE_URL, config.databaseUrl),
    database:         selectValue(process.env.DATABASE, config.database),
    databasePort:     selectValue(process.env.DATABASE_PORT, config.databasePort)
};

module.exports = configuration;