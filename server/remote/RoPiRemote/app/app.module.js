(function () {
    'use strict';

    angular.module('app', ['ngCookies', 'ui.router'])
           .config(['$stateProvider', '$urlRouterProvider', '$logProvider',
               function ($stateProvider, $urlRouterProvider, $logProvider) {

                   // enable debugging based on debugMode
                   $logProvider.debugEnabled(true);

                   // For any unmatched URL redirect to main URL
                   //$urlRouterProvider.otherwise("/login");

                   $stateProvider
                       .state('main', {
                           url: "/main",
                           views: {
                               'main': {
                                   templateUrl: "app/main/main.view.html",
                                   controller: "mainController as vm"
                               }
                           }
                       });
               }]);
})();