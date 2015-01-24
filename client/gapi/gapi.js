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
    return {
        immediate: immediate,
        client_id: "182467596451-qubeiec3osp7iqhuqqp4sb3jrdgpk8ah.apps.googleusercontent.com",
        scope: loginScopes.join(" "),
        cookie_policy: "single_host_origin",
        response_type: "code"    
    };
};

var auth = function(immediate) {
    var deferred = Q.defer();
    immediate = immediate === undefined ? false : immediate;

    gapiIsReadyPromise.then(function(gapi) {   
        gapi.auth.authorize(options(immediate))
            .then(function() {
                Q.all([
                    loadApi(gapi, "oauth2", "v2") 
                ])
                .then(function() { 
                    console.log("Loaded all APIs");
                    gapiLoadedApisDeferred.resolve(gapi);
                    deferred.resolve(true); 
                })
                .catch(deferred.reject);
            }, function(error) { 
                return auth(false);
            });
    })
    .done();

    return deferred.promise;
};

var readAuthUser = function(gapi) {
    var deferred = Q.defer();
    
    try {
        gapi.client.oauth2.userinfo.get().execute(function(response) {
            console.log(response);
            deferred.resolve(response.email);
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
        
        // yeah what ever.. I hate working with gapi.. *punch punch*
        isAuthorized: function() {
            var deferred = Q.defer();
            get().then(function(gapi) {
                if (!gapi.client.oauth2) {
                    // api not loaded but user might still be logged in; try logging in to see what happens behind the 
                    // scene
                    auth(true)
                        .then(function() {
                            readAuthUser(gapi).done(deferred.resolve, deferred.reject);
                        })
                        .catch(deferred.reject)
                        .done();
                } else {
                    readAuthUser(gapi).done(deferred.resolve, deferred.reject);
                }
            });
            
            return deferred.promise;
        }
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
           "}(window,document,'script'));  " +
           "gapi.analytics.ready(function() { " +
           "    console.log('DONE');  " +
           "    " +
           "}); ";
        
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
