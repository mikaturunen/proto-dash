/* global gapi, console, require, angular, document */

"use strict";

var name = "dash.gapi";
var dependencyMap = require("../dependency-map").add(name);
var constants = require("../../server/utilities/constants");
// using Q over $q as I like Q more with its .done() :P
var Q = require("q");

var gapiIsReadyDeferred = Q.defer();
var gapiIsReadyPromise = gapiIsReadyDeferred.promise;

var service = function() {
    return {
        auth: function() {
            gapi.auth.authorize({
                // EXCUSE ME GOOGLE, REALLY? space-delimited? WHAT? ... Wow, thanks.
                immediate: false,
                client_id: "182467596451-qubeiec3osp7iqhuqqp4sb3jrdgpk8ah.apps.googleusercontent.com",
                scope: "https://www.googleapis.com/auth/analytics.readonly https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/userinfo.email"
            }).then(function() {
                console.log("signed in + accepted >:]");
                // TODO LOAD ALL REQUIRED GAPIS HERE!
            });
            
            // this way actual popup blockers do not intervene with the signin process - yatta!
            gapi.auth.init()
        },
        
        get: function() {
            return gapiIsReadyPromise;
        },
        
        authorized: function() {
            var deferred = Q.defer();
            
            gapiIsReadyPromise
                .then(function(gapi) {
                    
                })
            
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
