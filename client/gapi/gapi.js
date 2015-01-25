/* global gapi, console, require, angular, document */
/* jslint node: true */
/* jshint esnext: true */

"use strict";

var name = "dash.gapi";
var dependencyMap = require("../dependency-map").add(name);
var constants = require("../../server/utilities/constants");

var loginScopes = [
    "https://www.googleapis.com/auth/analytics.readonly",
    "https://www.googleapis.com/auth/plus.login", 
    "https://www.googleapis.com/auth/userinfo.email"
];

var gapiIsReadyDeferred;
var gapiIsReadyPromise;

// TODO COMMENTS!

var service = $q => {
    var gapiLoadedApisDeferred = $q.defer();
    var gapiLoadedApisPromise = gapiLoadedApisDeferred.promise;

    var get = () => {
        return gapiIsReadyPromise;
    };

    var loadApi = (gapi, api, version) => {
        var deferred = $q.defer();
        
        gapi.client.load(api, version, () => {
            deferred.resolve(true);
        });
        
        return deferred.promise;
    };

    var options = (immediate) => {
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

    var apiLoader = gapi => {
        var deferred = $q.defer();
        
        loadApi(gapi, "oauth2", "v2") 
            .then(() => { 
                console.log("Loaded all APIs");
                gapiLoadedApisDeferred.resolve(gapi);
                apisInPlace = true;
                deferred.resolve(true); 
            })
            .catch(deferred.reject);
        
        return deferred.promise;
    };

    var auth = immediate => {
        var deferred = $q.defer();

        gapiIsReadyPromise.then(gapi => {   
            gapi.analytics.auth.on("success", response => { 
                apiLoader(gapi).then(deferred.resolve, deferred.reject);
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
        });

        return deferred.promise;
    };

    var readAuthUser = () => {
        var deferred = $q.defer();
        
        try {
            if (!apisInPlace) {
                // No need to wait here as the below gapiLoaded promise will take care of that.
                // We have to auth the client again in immediate mode for it to work properly
                gapiIsReadyPromise.then(gapi => { 
                    console.log("Apis are not in place, immediate auth and reload");
                    gapi.auth.authorize(options(true)).then(() => {
                        console.log("Starting to load apis");
                        apiLoader(gapi);
                    }, deferred.reject);
                });
            }
            
            gapiLoadedApisPromise.then(gapi => {
                gapi.client.oauth2.userinfo.get().execute(response => {
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

    return {
        get: get,
        auth: auth,
        isAuthorized: readAuthUser
    };
};
service.$inject = [ "$q" ];
service.serviceName = "gapi";

angular
    .module(name)
    .run(["$q", ($q) => {
        gapiIsReadyDeferred = $q.defer();
        gapiIsReadyPromise = gapiIsReadyDeferred.promise;

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
        gapi.analytics.ready(() => {
            console.log("gapi.analytics is ready for use.");
            gapiIsReadyDeferred.resolve(gapi); 
        });
    }])
    .service(service.serviceName, service);
