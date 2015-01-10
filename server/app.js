var path = require("path");
var express = require("express");
var app = express();

// heroku, please? This is rage inducing.
process.env.PWD = process.cwd();

var publicPath = path.join(process.env.PWD, "client");

app.set("port", (process.env.PORT || 3000));
app.use("/public", express.static(publicPath));

console.log("/public ==", publicPath);

// TODO Define specific routes. 

// From all other routes we return index.html for now... 
app.get("/", function(request, response) {
    var indexHtml = path.join(process.env.PWD, "client", "html", "index.html");
    response.sendFile(indexHtml);
});

app.listen(app.get("port"), function() {
    console.log("Node app is running at localhost:" + app.get('port'));
});