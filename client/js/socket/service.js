"use strict";

var name = "Socket";
var moduleName = "AnalyticsDashboard." + name;

require("../dependency-map").add(moduleName);

 var factory = function(socketFactory) {
     return socketFactory();
};
factory.$inject = [ "socketFactory" ];

angular
    .module(moduleName, [ ])
    .factory(name.toLowerCase(), factory);


