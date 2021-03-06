/* global console, require, __dirname, process, module */
/* jslint node: true */
/* jshint esnext: true */

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
 * @param {string} lhs Left-hand side variable,
 * @param {string} rhg Right-hande side variable.
 * @returns {string} Lhs when it's defined and rhs otherwise.
 */
var selectValue = (lhs, rhs) => {
    if (lhs !== undefined && lhs.trim() !== "") {
        return lhs;
    }
    return rhs;
};

// Setup all the configurations based on the environmental of configuration given variables. 
// NOTE: configuration files are never populated into GitHub for more or less obvious reasons :)
var configuration = {
    databaseUser:     selectValue(process.env.DATABASE_USER, config.databaseUser),
    databasePassword: selectValue(process.env.DATABASE_PASSWORD, config.databasePassword),
    databaseUrl:      selectValue(process.env.DATABASE_URL, config.databaseUrl),
    database:         selectValue(process.env.DATABASE, config.database),
    databasePort:     selectValue(process.env.DATABASE_PORT, config.databasePort)
};

module.exports = configuration;