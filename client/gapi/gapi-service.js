/* global gapi, console, require, angular, document */
/* jslint node: true */
/* jshint esnext: true */

"use strict";

var name = "dash.gapi";
var dependencyMap = require("../dependency-map").add(name);
var constants = require("../../server/utilities/constants");

// TODO COMMENTS!
var service = ($q, $window, $state) => {
    var scopes = [
                "https://www.googleapis.com/auth/analytics.readonly",
                "https://www.googleapis.com/auth/plus.login", 
                "https://www.googleapis.com/auth/userinfo.email" 
            ].join(" ");

    var clientId = "182467596451-qubeiec3osp7iqhuqqp4sb3jrdgpk8ah.apps.googleusercontent.com";

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

    var generateLoadPromise = (api, version) => {
        var deferred = $q.defer();
        
        $window
            .gapi
            .client
            .load(api, version, () => {
                console.log("Loaded api", api, ", version", version);
                deferred.resolve(true);
            }, deferred.reject);
        
        return deferred.promise;     
    };

    var isCalledOnce = false;
    var callAnalyticsAuthOnce = (redirectOptions) => {
        var deferred = $q.defer();

        if (isCalledOnce === false) {
            isCalledOnce = true;

            try {
                console.log("attempting to auth");

                $window.gapi.analytics.auth.on("success", response => { 
                    console.log("Auth success.");
                    deferred.resolve(true);

                    if (redirectOptions && redirectOptions.success) {
                        console.log("Requested redirect on auth success... redirecting");
                        $state.go(redirectOptions.success);
                    }
                });

                $window.gapi.analytics.auth.on("error", response => { 
                    console.log("Auth failed.");
                    deferred.reject(false);

                    if (redirectOptions && redirectOptions.failed) {
                        console.log("Requested redirect on auth failure... redirecting");
                        $state.go(redirectOptions.failed);
                    }
                });

                $window.gapi.analytics.auth.authorize({
                    clientid: clientId,
                    scope: scopes,
                    container: "embed-api-auth-container"
                }); 
            } catch (error) {
                console.log("Error in callAnalyticsAuthOnce:", error);
                deferred.reject(error);
            }
        } else {
             deferred.resolve(true);
        }
       
        return deferred.promise;
    };

    var loader = () => {
        var deferred = $q.defer();

        generateLoadPromise("oauth2", "v2")
            .then(() => { return generateLoadPromise("analytics", "v3"); })
            .then(deferred.resolve, deferred.reject);

        return deferred.promise;
    };

    return {
        generate: generate,
        loadApis: loader,
        callAnalyticsAuthOnce: callAnalyticsAuthOnce,
        clientId: clientId,
        scopes: scopes
    };
};
service.$inject = [ "$q", "$window", "$state" ];
service.serviceName = "gapiservice";

angular
    .module(name)
    .service(service.serviceName, service);
