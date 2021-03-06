// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'ngCordova', 'starter.controllers', 'starter.services','angularMoment'])

  .run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);

      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
      var push = new Ionic.Push({
        "debug": true
      });

      push.register(function (token) {
        // console.log("My Device token:", token.token);
        // prompt('copy token', token.token);
        window.localStorage.token = token.token;
        push.saveToken(token);  // persist the token in the Ionic Platform
      });

    });
  })

    .config(function ($httpProvider) {
    $httpProvider.interceptors.push(function ($rootScope) {
      return {
        request: function (config) {
          $rootScope.$broadcast('loading:show')
          return config
        },
        response: function (response) {
          $rootScope.$broadcast('loading:hide')
          return response
        }
      }
    })
  })

  .run(function ($rootScope, $ionicLoading) {
    $rootScope.$on('loading:show', function () {
      $ionicLoading.show({ template: 'กรุณารอสักครู่' })
    })

    $rootScope.$on('loading:hide', function () {
      $ionicLoading.hide()
    })
  })

  .config(function ($stateProvider, $urlRouterProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

      // setup an abstract state for the tabs directive
      .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html'
      })

      .state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: 'LogInCtrl'
      })


      .state('tab.listreturn', {
        url: '/listreturn',
        views: {
          'tab-account': {
            templateUrl: 'templates/listreturn.html',
            controller: 'ReturnCtrl'
          }
        }
      })

      .state('tab.returndetail', {
        url: '/returndetail:{data}',
        views: {
          'tab-account': {
            templateUrl: 'templates/returndetail.html',
            controller: 'ReturnDetailCtrl'
          }
        }
      })

      // Each tab has its own nav history stack:

      .state('tab.transport', {
        url: '/transport',
        views: {
          'tab-transport': {
            templateUrl: 'templates/tab-transport.html',
            controller: 'TransportCtrl'
          }
        }
      })

      .state('tab.requestdetail', {
        url: '/requestdetail:{data}',
        views: {
          'tab-transport': {
            templateUrl: 'templates/requestdetail.html',
            controller: 'TransportDetailCtrl'
          }
        }
      })

      .state('tab.map', {
        url: '/map',
        views: {
          'tab-map': {
            templateUrl: 'templates/tab-map.html',
            controller: 'MapCtrl'
          }
        }
      })
      .state('tab.chat-detail', {
        url: '/chats/:chatId',
        views: {
          'tab-chats': {
            templateUrl: 'templates/chat-detail.html',
            controller: 'ChatDetailCtrl'
          }
        }
      })

      .state('tab.account', {
        url: '/account',
        views: {
          'tab-account': {
            templateUrl: 'templates/tab-account.html',
            controller: 'AccountCtrl'
          }
        }
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/login');

  });
