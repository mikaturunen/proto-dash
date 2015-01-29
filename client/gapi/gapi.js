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
 */
var service = ($q, $window, $state, gapiservice, $location) => {
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

    /** 
     * Logs out the current active user and clears the related cookies from the cookie store.
     */
    var logout = () => {
        console.log("Logging user out..");

        // Simply calling the signout() is not enough as the same user with the same browser can instantly log back in 
        // without confirmation or password. We need to make sure the cookies are dead with the help of Google.
        $window.gapi.auth.signOut();

        // Redirecting the user to google for logout -> google app engine as middleman and back to -> application.
        // You cannot redirect user back to custom domain / application from google directly so you'll have to use 
        // appEngine as the middle-man in doing this.
        
        // Honestly.. I didn't think I would be doing something like this in the 2015.. 
        var applicationLoginPage = $location.protocol() + "://" + $location.host() + ":" + $location.port();
        var logoutGoogleAccount = "https://www.google.com/accounts/Logout?continue=";
        var usingAppEngineAsMiddleMan = "https://appengine.google.com/_ah/logout?continue=";
        var completeURL = logoutGoogleAccount + usingAppEngineAsMiddleMan + applicationLoginPage;

        // Start the whole redirect chain of events.
        $window.location.href = completeURL;
    };

    return {
        auth: auth,
        isAuthorized: isAuthorized,
        logout: logout
    };
};
service.$inject = [ "$q", "$window", "$state", "gapiservice", "$location" ];
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
