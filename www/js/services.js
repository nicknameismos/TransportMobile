angular.module('starter.services', [])
  .factory('RequestordersService', function ($http) {
    var apiUrl = 'https://thamapptest.herokuapp.com/api';
    // instantiate our initial object
    var RequestordersService = function () {
      this.responseorders = [];
      this.getResponseorder();
    };

    // define the getProfile method which will fetch data
    // from GH API and *returns* a promise
    RequestordersService.prototype.getResponseorder = function () {

      // Generally, javascript callbacks, like here the $http.get callback,
      // change the value of the "this" variable inside it
      // so we need to keep a reference to the current instance "this" :
      var self = this;

      return $http.get(apiUrl + '/requestorders').then(function (response) {

        // when we get the results we store the data in user.profile
        self.responseorders = response.data

        // promises success should always return something in order to allow chaining
        return response;

      });
    };
    return RequestordersService;
  })

  .service('AuthService', ['$http', '$q', function ($http, $q) {
    var apiURL = 'https://thamapptest.herokuapp.com/api';
    this.saveUser = function (user) {
      return $http.post(apiURL + '/auth/signup', user);

    };
    this.loginUser = function (login) {

      var dfd = $q.defer();

      $http.post(apiURL + '/auth/signin', login).success(function (database) {
        window.localStorage.user = JSON.stringify(database);
        dfd.resolve(database);
      }).error(function (error) {
        /* Act on the event */
        dfd.resolve(error);
        // return dfd.promise;
      });
      return dfd.promise;
    };

    this.saveUserPushNoti = function (push_user) {
      var dfd = $q.defer();

      $http.post(apiURL + '/pushnotiusers', push_user).success(function (database) {
        dfd.resolve(database);
      }).error(function (error) {
        /* Act on the event */
        // console.log(error);
        alert(JSON.stringify(error));
        dfd.resolve(error);
        // return dfd.promise;
      });
      return dfd.promise;
    };

    this.getUser = function () {
      return JSON.parse(window.localStorage.user || null);
    };

    this.signOut = function () {
      // window.localStorage.clear();
      window.localStorage.removeItem('user');
      return true;
    };
  }])

  .service('RequestService', ['$http', '$q', function ($http, $q) {
    var apiURL = 'https://thamapptest.herokuapp.com/api';
    this.getResponseorder = function () {
      var dfd = $q.defer();
      $http.get(apiURL + '/requestorders').success(function (responseorders) {
        dfd.resolve(responseorders);
      });
      return dfd.promise;

    };

    this.updateResponseOrder = function (responseorderId, responseorder) {
      var dfd = $q.defer();
      $http.put(apiURL + '/requestorders/' + responseorderId, responseorder).success(function (responseorders) {
        // if (window.localStorage.token && window.localStorage.user) {
        //   var userStore = JSON.parse(window.localStorage.user);
        //   var push_usr = {
        //     user_id: userStore._id,
        //     user_name: userStore.username,
        //     role: 'transporter',
        //     device_token: window.localStorage.token
        //   };
        //   AuthService.saveUserPushNoti(push_usr)
        //     .then(function (res) {
        //       console.log('success');
        //     });
        // }
        dfd.resolve(responseorders);
      });
      return dfd.promise;
    };
  }]);
