var path = require("path");
var express = require("express");
var app = express();


var staticRouteMappings = [
  { directory: path.join(__dirname, "..", "client"), url: "/public" }
];

app.set("port", (process.env.PORT || 3000));
staticRouteMappings.forEach(function(mapping) {
  app.use(mapping.url, express.static(mapping.directory));                      
});



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