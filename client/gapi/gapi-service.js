/* global gapi, console, require, angular, document */
/* jslint node: true */
/* jshint esnext: true */

"use strict";

var name = "dash.gapi";
var dependencyMap = require("../dependency-map").add(name);
var constants = require("../../server/utilities/constants");

/**
 * Service for easing the use of GAPI client with Angular. 
 * @param  {ng-service} $q     
 * @param  {ng-service} $window 
 * @param  {ng-service} $state  
 * @return {Object} The service object.
 */
var service = ($q, $window, $state) => {
    /**
     * Scopes for the GAPI we are using.
     */
    var scopes = [
                "https://www.googleapis.com/auth/analytics.readonly",
                "https://www.googleapis.com/auth/plus.login", 
                "https://www.googleapis.com/auth/userinfo.email" 
            ].join(" ");

    /** 
     * Specific client ID - could be debated is it wise to release this into github but for now
     * it is; as it's not for real use and later it'll be populated through env variables.
     */
    var clientId = "182467596451-qubeiec3osp7iqhuqqp4sb3jrdgpk8ah.apps.googleusercontent.com";

    /**
     * Generates a single component through GAPI
     * @param  {Object} gapiQuery Object that represents the content that gapi DataChart digests
     * @return {Promise} Promise that resolves to the generated component. Rejects on error.
     */
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

        var chart = new $window.gapi.analytics.googleCharts.DataChart(gapiQuery);
        chart.on("success", (opt1, opt2) => {
            console.log("SUCCESS:", opt1, opt2);
            deferred.resolve(true);
        });
        chart.on("error", (opt1, opt2) => {
            console.log("ERROR:", opt1, opt2);
            deferred.reject(opt1);
        });
        chart.execute();

        return deferred.promise;
    };

    /** 
     * Wrapper for loading specific apis onto GAPI. Generates promise for the loading operation.
     * @param  {string} api     gapi api to load
     * @param  {string} version gapi api version to load
     * @return {Promise}        resolves true on success
     */
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

    /**
     * Follows have we called gapi.analytics.auth.authorize already
     */
    var isCalledOnce = false;

    /**
     * Calls the gapi.analytics.auth once and makes sure following calls do not call it again. Gapi explodes if it's 
     * called multiple times and it's required behavior for login / authenticating the interfaces
     * @param  {{ success: string; failed: string; }} redirectOptions Containing potential $state.go targets for auth events
     * @return {Promise} Resolves to true on authenticated
     */
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
                    container: "embed-api-auth-container", 
                    cookie_policy: "single_host_origin"
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

    /** 
     * Loads all specified APIs into gapi as part of the initial procedure of hooking up gapi into $window.
     * @return {Promise} True when all apis are loaded
     */
    var loader = () => {
        var deferred = $q.defer();

        generateLoadPromise("oauth2", "v2")
            .then(() => { return generateLoadPromise("analytics", "v3"); })
            .then(deferred.resolve, deferred.reject);

        return deferred.promise;
    };

    /**
     * The actual service we are returning
     */
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
