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
var loginScopes = [
    "https://www.googleapis.com/auth/analytics.readonly",
    "https://www.googleapis.com/auth/plus.login", 
    "https://www.googleapis.com/auth/userinfo.email"
];

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

var service = function() {
    return {
        get: get,
        auth: function() {
            var deferred = Q.defer();
            console.log("Getting");
            
            get().then(function(gapi) {
                console.log("Got");
                gapi.auth.authorize({
                    immediate: false,
                    client_id: "182467596451-qubeiec3osp7iqhuqqp4sb3jrdgpk8ah.apps.googleusercontent.com",
                    scope: loginScopes.join(" ")
                })
                .then(function() {
                    console.log("User has signed in. Starting to load the required API's");
                    Q.all([
                        loadApi(gapi, "oauth2", "v2") 
                    ])
                    .then(function() { 
                        console.log("Loaded all APIs");
                        deferred.resolve(true); 
                    })
                    .catch(deferred.reject);
                });
                
                gapi.auth.init();
            })
            .done();
            
            return deferred.promise;
        },
        
        isAuthorized: function() {
            var deferred = Q.defer();
            
            get().then(function(gapi) {
              
                gapi.client.oauth2.userinfo.get().execute(function(response) {
                    console.log(response);
                    deferred.resolve(true);
                });
            });
            
            return deferred.promise;
        }
    };
};
service.serviceName = "gapi";

angular
    .module(name)
    .run(function($timeout) {
        console.log("RUNNING");
        // Wow, I'm surprised there's no really clean way of doing this.. I hate myself for this
        var scriptText = "" +
            "(function(w,d,s,g,js,fjs){" +
                "g=w.gapi||(w.gapi={});g.analytics={q:[],ready:function(cb){this.q.push(cb)}};" +
                "js=d.createElement(s);fjs=d.getElementsByTagName(s)[0];" +
                "js.src='https://apis.google.com/js/platform.js';" +
                "fjs.parentNode.insertBefore(js,fjs);js.onload=function(){g.load('analytics')};" +
            "}(window,document,'script'));";
        
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
