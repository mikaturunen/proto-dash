/* global gapi, console, require, angular, document */
/* jslint node: true */

"use strict";

var name = "dash.gapi";
var dependencyMap = require("../dependency-map").add(name);
var constants = require("../../server/utilities/constants");
// using Q over $q as I like Q more with its .done() :P
var Q = require("q");

var gapiIsReadyDeferred = Q.defer();
var gapiIsReadyPromise = gapiIsReadyDeferred.promise;
var gapiLoadedApisDeferred = Q.defer();
var gapiLoadedApisPromise = gapiLoadedApisDeferred.promise;

var loginScopes = [
    "https://www.googleapis.com/auth/analytics.readonly",
    "https://www.googleapis.com/auth/plus.login", 
    "https://www.googleapis.com/auth/userinfo.email"
];

// TODO COMMENTS!

var get = function() {
    return gapiIsReadyPromise;
};

var loadApi = function(gapi, api, version) {
    var deferred = Q.defer();
    
    gapi.client.load(api, version, function() {
        deferred.resolve(true);
    });
    
    return deferred.promise;
};

var options = function(immediate) {
    var clientId = "182467596451-qubeiec3osp7iqhuqqp4sb3jrdgpk8ah.apps.googleusercontent.com";
    if (immediate === true) {
         return {
             immediate: immediate,
             client_id: clientId,
             scope: loginScopes.join(" ")
         };
    } else {
       // When not explicitly in immediate mode we try to hook up the actual container
       return {
           container: "embed-api-auth-container",
           clientid:  clientId,
           scope: loginScopes.join(" ")
       };
    }
};

var calledOnce = false;
var apisInPlace = false;

var apiLoader = function(gapi) {
    var deferred = Q.defer();
    
    Q.all([
        loadApi(gapi, "oauth2", "v2") 
    ])
    .done(function() { 
        console.log("Loaded all APIs");
        gapiLoadedApisDeferred.resolve(gapi);
        apisInPlace = true;
        deferred.resolve(true); 
    }, deferred.reject);
    
    return deferred.promise;
};

var auth = function(immediate) {
    var deferred = Q.defer();

    gapiIsReadyPromise.then(function(gapi) {   
        gapi.analytics.auth.on("success", function(response) { 
            apiLoader(gapi).done(deferred.resolve, deferred.reject);
        });
        
        // TODO sort out this awful mess of a gapi magic..
        try {
            if (calledOnce === false) {
                // NOTE message: "gapi.analytics.auth.authorize should not be invoked multipletimes"
                console.log("Calling analytics auth for authorization", immediate);
                calledOnce = true;
                gapi.analytics.auth.authorize(options(immediate)); 
            } else if (gapi.analytics.auth.isAuthorized() === true) {
                deferred.resolve(true); 
            } else {
                deferred.reject("not authorized :3");
            }
        } catch (error) {
            if (immediate && gapi.analytics.auth.isAuthorized() === true) {
                deferred.resolve(true);
                return;
            }
            
            // digesting the error - shaddap gapi!
            console.log(error);
            deferred.reject(error);
        }
    })
    .done();

    return deferred.promise;
};

var readAuthUser = function(gapi) {
    var deferred = Q.defer();
    
    try {
        if (!apisInPlace) {
            // No need to wait here as the below gapiLoaded promise will take care of that
            gapiIsReadyPromise.done(function(gapi) { 
                gapi.auth.authorize(options(true)).then(function() {
                    apiLoader(gapi).done();
                });
            });
        }
        
        gapiLoadedApisPromise.done(function(gapi) {
            gapi.client.oauth2.userinfo.get().execute(function(response) {
                console.log(response);
                deferred.resolve(response.email);
            });
        });
    } catch (error) {
        console.error(error);
        deferred.reject(error);
    }
    
    return deferred.promise;
};

var service = function() {
    return {
        get: get,
        auth: auth,
        isAuthorized: readAuthUser
    };
};
service.serviceName = "gapi";

angular
    .module(name)
    .run(function($timeout) {
        // Wow, I'm surprised there's no really clean way of doing this.. I hate myself for this
        var scriptText = ""+
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
        gapi.analytics.ready(function () {
            console.log("gapi.analytics is ready for use.");
            gapiIsReadyDeferred.resolve(gapi); 
        });
    })
    .service(service.serviceName, service);
