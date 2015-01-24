/* global require, process */
/* jslint node: true */

/*
 * Due to the fact that we are deploying from public repository with no private details we have to hide our sensitive 
 * information in our shared cloud development environment and release information in our CD - let's see how this plays
 * out :) - obviously we cannot push the details into github public repo so.. Something had to be done or we would
 * be doing manual releases and that's a huge no-no as I'm lazy. Sensitive information being database credentials,
 * API keys and such. Nothing too fancy to be fair.
 */

var Q = require("q");
var fs = require("fs")
var path = require("path");
var config = require(path.join(__dirname,"./config/config.json"));

// either CD environment variable or cloud environments configuration file - it's in .gitignore for a reason and a 
// place-holder lays in github - Let us hope that by accident we don't push our details to github ;)
var configuration = {
    databaseUser: process.env.DATABASE_USER || config.databaseUser,
    databasePassword: process.env.DATABASE_PASSWORD || config.databasePassword,
    databaseUrl: process.env.DATABASE_URL || config.databaseUrl,
    database: process.env.DATABASE || config.database,
    databasePort: process.env.DATABASE_PORT || config.databasePort
};
var configurationPath = path.join(__dirname, "./config/configuration.json");

Q.ninvoke(    
        fs, 
        "writeFile", 
        configurationPath, 
        JSON.stringify(configuration, null, 4)
     )
    .then(function() {
        console.log(configurationPath, "written and ready for use in release.");
    })
    .catch(function(error) {
        console.log(error);
    })
    .done();
