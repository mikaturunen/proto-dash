/* global gapi, console, require, angular, document */
/* jslint node: true */
/* jshint esnext: true */

"use strict";

var name = "dash.gapi";
var dependencyMap = require("../dependency-map").add(name);
var constants = require("../../server/utilities/constants");

var gapiIsReadyDeferred;
var gapiIsReadyPromise;

/** 
 * Service for immediate GAPI usage; commonly one would use it through the $window service but 
 * this service abstracts few behaviors such as the more or less broken authentication/authorization of gapi. I'm not even
 * kidding.
 * @param  {ng-service} $q          
 * @param  {ng-service} $window     
 * @param  {ng-service} $state      
 * @param  {ng-service} gapiservice 
 */
var service = ($q, $window, $state, gapiservice) => {
    /**
     * Attempts to authenticate the provided client.
     * @param  {{ success: string; failed: string; }}} redirectOptions Options for redirecting the user if necessary. 
     * @return {Promise}                 Promise resolving to true on success authentication.
     */
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

    /**
     * Checks if the current client is authorized through gapi to see google's services. Even if user fakes this result
     * all the calls to google will fail. 
     * @return {Promise} True when authorized.
     */
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
        auth: auth,
        isAuthorized: isAuthorized
    };
};
service.$inject = [ "$q", "$window", "$state", "gapiservice" ];
service.serviceName = "gapi";

/** 
 * Run block for the current module. This makes sure the gapi gets injected into the current web page in most
 * hassle free way possible. 
 * @param  {ng-service} $q              
 * @param  {ng-service} gapiservice  
 */
var run = ($q, gapiservice) => {
    gapiIsReadyDeferred = $q.defer();
    gapiIsReadyPromise = gapiIsReadyDeferred.promise;

    // NOTE I don't agree at all with the way GAPI operates and how it has been designed to 'dynamically' be injected
    //      into the website. I think it breaks too many princibles of a modern web application. This is not a good thing.
    //      This is a quick attempt to just try and go ahead in wrapping the horrible implementation of gapi into a more
    //      decent usage case and to make sure it would behave nicely with the Angular applications life cycle.

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
};
run.$inject = [ "$q", "gapiservice" ];

angular
    .module(name)
    .run(run)
    .service(service.serviceName, service);
