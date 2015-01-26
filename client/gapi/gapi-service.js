/* global gapi, console, require, angular, document */
/* jslint node: true */
/* jshint esnext: true */

"use strict";

var name = "dash.gapi";
var dependencyMap = require("../dependency-map").add(name);
var constants = require("../../server/utilities/constants");

// TODO COMMENTS!
var service = ($q, gapi) => {
    var generate = gapiQuery => {
        var deferred = $q.defer();

        if (!gapiQuery) {
            deferred.reject("gapiQuery (.gapi) undefined.");
            return deferred.promise;
        }

        console.log("Generating gapi.analytics.googleCharts.DataChart from:", gapiQuery);

        // Adding the 'ga:' if it's missing. This thing is REALLY easy to miss...
        if (gapiQuery.ids && gapiQuery.ids.substring(0, 3) !== "ga:") {
            gapiQuery.ids = "ga:" + gapiQuery.ids;
        }

        gapi.get()
            .then(gapi => {
              /*  var chart = gapi.analytics.googleCharts.DataChart(gapiQuery);
                chart.on("success", (opt1, opt2) => {
                    console.log("SUCCESS:", opt1, opt2);
                    deferred.resolve(true);
                });
                chart.on("error", (opt1, opt2) => {
                    console.log("ERROR:", opt1, opt2);
                    deferred.reject();
                });
                chart.execute();
                */
                deferred.resolve(true);
            })
            .catch(deferred.reject);

        return deferred.promise;
    };

    return {
        generate: generate
    };
};
service.$inject = [ "$q", "gapi" ];
service.serviceName = "gapicomponents";

angular
    .module(name)
    .service(service.serviceName, service);
