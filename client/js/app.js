"use strict";

var googleAnalyticsController = function($scope) {
    $scope.charts = 
        [
            {
                reportType: "ga",
                query: {
                    metrics: "ga:sessions",
                    dimensions: "ga:date",
                    "start-date": "30daysAgo",
                    "end-date": "yesterday"
                },
                chart: {
                    container: "chart-container-1",
                    type: "LINE",
                    options: {
                        width: "100%"
                    }
                }
            }, 
            {
                reportType: "ga",
                query: {
                    metrics: "ga:sessions",
                    dimensions: "ga:browser",
                    "start-date": "30daysAgo",
                    "end-date": "yesterday"
                },
                chart: {
                    container: "chart-container-2",
                    type: "PIE",
                    options: {
                        width: "100%",
                        is3D: true,
                        title: "Browser Usage"
                    }
                }
            }
        ];

    $scope.extraChart = {
        reportType: "ga",
        query: {
            metrics: "ga:sessions",
            dimensions: "ga:date",
            "start-date": "30daysAgo",
            "end-date": "yesterday",
            ids: "ga:81197147" // put your viewID here
        },
        chart: {
            container: "chart-container-3",
            type: "LINE",
            options: {
                width: "100%"
            }
        }
    };

    $scope.queries = [{
        query: {
            ids: "ga:81197147",  // put your viewID here
            metrics: "ga:sessions",
            dimensions: "ga:city"
        }
    }];

    // if a report is ready
    $scope.$on("$gaReportSuccess", function (e, report, element) {
        console.log(report, element);
    });
};

var prototypeName = "analytics-dashboard";
var controllerName = "DashboardController";
var dashModuleName = "DashboardModule";

var configuration = function($stateProvider, $urlRouterProvider, $locationProvider) {
    $urlRouterProvider.otherwise("/")
    // we want the fully functional html5 mode (also removes the # -sign from the URL)
    $locationProvider.html5Mode(true);

    // defining the used states -- can we survive with just one state for the dashboard?
    $stateProvider.state("dashboard", {
        url: "/",
        templateUrl: "public/html/dashboard.html",
        controller: controllerName
    }); 
};

angular
    .module(dashModuleName, [ ])
    .controller(controllerName, googleAnalyticsController);

angular
    .module(prototypeName, [
        "ui.router", 
        "ui.bootstrap", 
        "btford.socket-io",
        "ngAnalytics",
        dashModuleName
    ])
    .run(["ngAnalyticsService", function(ngAnalyticsService) {  
        // injecting the service with credentials
        ngAnalyticsService.setClientId("332578592932-3c2fb27m0lr5dljnv8f4o9nvhkglqr56.apps.googleusercontent.com")
    }])
    .config(configuration);