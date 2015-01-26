/* global gapi, console, require, angular, document */
/* jslint node: true */
/* jshint esnext: true */

"use strict";

var name = "dash.gapi";
var dependencyMap = require("../dependency-map").add(name);
var constants = require("../../server/utilities/constants");


var gapiIsReadyDeferred;
var gapiIsReadyPromise;

// TODO COMMENTS!

var service = ($q, $window, $state, gapiservice) => {
    var get = () => {
        return gapiIsReadyPromise;
    };

    var auth = (redirectOptions) => {
        var deferred = $q.defer();

        gapiIsReadyPromise.then(() => {   
            gapiservice
                .callAnalyticsAuthOnce(redirectOptions)
                .then(() => {
                    if ($window.gapi.analytics.auth.isAuthorized() === true) {
                        deferred.resolve(true);
                    } else {
                        console.log("Not authed");
                        deferred.reject(false);
                    }
                })
                .catch(error => {
                    console.log(error);
                    deferred.reject(error);
                });
        });

        return deferred.promise;
    };

    var isAuthorized = () => {
        var deferred = $q.defer();
        
        gapiIsReadyPromise.then(() => { 
            try {
                $window.gapi.client.oauth2.userinfo.get().execute(response => {
                    console.log("Initial response from oauth2:", response);
                    deferred.resolve(response);
                });
            } catch (error) {
                console.error(error);
                deferred.reject(error);
            }
        });

        return deferred.promise;
    };

    return {
        get: get,
        auth: auth,
        isAuthorized: isAuthorized
    };
};
service.$inject = [ "$q", "$window", "$state", "gapiservice" ];
service.serviceName = "gapi";

angular
    .module(name)
    .run(["$q", "gapiservice", ($q, gapiservice) => {
        gapiIsReadyDeferred = $q.defer();
        gapiIsReadyPromise = gapiIsReadyDeferred.promise;

        // Wow, I'm surprised there's no really clean way of doing this.. I hate myself for this
        var scriptText = "" +
           "(function(w,d,s,g,js,fs){ " +
                "g=w.gapi||(w.gapi={});g.analytics={q:[],ready:function(f){this.q.push(f);}}; " +
                "js=d.createElement(s);fs=d.getElementsByTagName(s)[0]; " +
                "js.src='https://apis.google.com/js/platform.js'; " +
                "fs.parentNode.insertBefore(js,fs);js.onload=function(){g.load('analytics');}; " +
           "}(window,document,'script'));  ";
        
        var gaCode = document.createTextNode(scriptText);
        var scriptTag = document.createElement("script");
        scriptTag.type = "text/javascript";
        
        // slam them dynamically into the body and be done with it. My soul weeps.
        scriptTag.appendChild(gaCode);
        document.body.appendChild(scriptTag);

        // now somewhat normalized behavior, quickly wrap the beast into promise 
        gapi.analytics.ready(() => {
            gapiservice.loadApis().then(() => {
                console.log("gapi.analytics is ready for use.");
                gapiIsReadyDeferred.resolve(gapi);
            }, 
            () => {
                console.log("Failed to load required apis for gapi.");
                gapiIsReadyDeferred.reject(false); 
            });
        });
    }])
    .service(service.serviceName, service);
