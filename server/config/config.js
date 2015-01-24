/* global console, require, __dirname, process, module */
/* jslint node: true */

var Q = require("q");
var fs = require("fs");
var path = require("path");
var configPath = path.join(__dirname, "./config/config.json");

// I could write fs.exists, go through the hassle of checking it and all but I thought I'd just do it this way for now,
// potential refactor target in the near future.
var config;
try {
    config = require(configPath);
} catch (error) {
    // File not found, digest error and create dummy!
    // We can safely assume that when there are no configuration file in place, we use environment variables
    config = { };
}

module.exports = {
    databaseUser: process.env.DATABASE_USER || config.databaseUser,
    databasePassword: process.env.DATABASE_PASSWORD || config.databasePassword,
    databaseUrl: process.env.DATABASE_URL || config.databaseUrl,
    database: process.env.DATABASE || config.database,
    databasePort: process.env.DATABASE_PORT || config.databasePort
};