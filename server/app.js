"use strict";

var path = require("path");
var express = require("express");
var app = express();

var releaseDirectory = path.join(__dirname, "..");

// creating a iterable list of static url we can safely use from the browser without express involving itself 
// with them too much
var staticRouteMappings = [
  { directory: path.join(releaseDirectory, "client"), url: "/public" }
];

app.set("port", (process.env.PORT || 3000));
staticRouteMappings.forEach(function(mapping) {
  app.use(mapping.url, express.static(mapping.directory));                      
});

// From all other routes we return index.html for now... 
app.get("*", function(request, response) {
    var indexHtml = path.join(releaseDirectory, "client", "html", "index.html");
    response.sendFile(indexHtml);
});

var server = app.listen(app.get("port"), function() {
    console.log("Node app is running at localhost:" + app.get('port'));
});

// TODO mode the socket initialization into its own place
var socket = require("socket.io");
var io = socket(server);
var constants = require("./utilities/constants")

io.on(constants.events.socket.connected, function(socket) {
    console.log("Socket connected to server.",socket.id);
    
    socket.on(constants.events.socket.disconnected, function() {
       console.log("Socket disconnected from server.", socket.id);
    });
});
