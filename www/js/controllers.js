angular.module('starter.controllers', [])

  .controller('LogInCtrl', function ($scope, $state, AuthService, $rootScope) {
    var push = new Ionic.Push({
      "debug": true,
      "onNotification": function (notification) {
        console.log(notification);
        $rootScope.$broadcast('onNotification');
        if (notification._raw.additionalData.foreground) {
          //   //alert(notification.message);
          $rootScope.$broadcast('onNotification');
        }
      }
    });

    push.register(function (token) {
      console.log("My Device token:", token.token);
      // prompt('copy token', token.token);
      window.localStorage.token = JSON.stringify(token.token);
      push.saveToken(token);  // persist the token in the Ionic Platform
    });

    $scope.userStore = AuthService.getUser();
    if ($scope.userStore) {

      var push_usr = {
        user_id: $scope.userStore._id,
        user_name: $scope.userStore.username,
        role: 'transporter',
        device_token: window.localStorage.token
      };
      AuthService.saveUserPushNoti(push_usr)
        .then(function (res) {
          $state.go('tab.transport');
        });
    }
    $scope.credentials = {}
    $scope.doLogIn = function (credentials) {
      var login = {
        username: credentials.username,
        password: credentials.password
      }
      AuthService.loginUser(login)
        .then(function (response) {
          //console.log(response);
          // alert('then');
          if (response["message"]) {
            $scope.credentials = {}
            alert('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
          }
          else {
            if (response.roles[0] === 'transporter') {

              var push_usr = {
                user_id: response._id,
                user_name: response.username,
                role: 'transporter',
                device_token: window.localStorage.token
              };
              AuthService.saveUserPushNoti(push_usr)
                .then(function (res) {
                  $scope.credentials = {}
                  $state.go('tab.transport');
                  $rootScope.$broadcast('onLoginSuccess');
                });
              // alert('success');
            } else {
              alert('คุณไม่มีสิทธิ์เข้าใช้งาน');
            }
          }
        });
      // console.log("doing sign up");

    };
  })

  .controller('TransportCtrl', function ($scope, $http, $state, AuthService, RequestService, $ionicModal, $rootScope, $stateParams) {

    $scope.init = function () {
      $scope.loadData();
    }
    $scope.$on('onNotification', function (event, args) {
      // do what you want to do
      $scope.init();
    });
    $rootScope.$on("$stateChangeSuccess", function (event, toState, toParams, fromState, fromParams) {
      // alert('ok');
      $scope.init();
    });
    $scope.loadData = function () {
      RequestService.getResponseorder()
        .then(function (data) {
          var userStore = AuthService.getUser();
          $rootScope.Response = data;
          $rootScope.countResponse = 0;
          if ($rootScope.countResponseReq) {
            $rootScope.countResponseReq = $rootScope.countResponseReq;
          }
          if ($rootScope.countResponseRes) {
            $rootScope.countResponseRes = $rootScope.countResponseRes;
          }
          if ($rootScope.countResponseRec) {
            $rootScope.countResponseRec = $rootScope.countResponseRec;
          }
          $scope.request = true;
          $scope.response = false;
          $scope.received = false;

          $scope.resquestorsersRequest = [];
          $scope.resquestorsersResponse = [];
          $scope.resquestorsersReceived = [];
          $rootScope.countResponseReq = 0;
          $rootScope.countResponseRes = 0;
          $rootScope.countResponseRec = 0;
          angular.forEach($rootScope.Response, function (request) {
            if (request.deliverystatus === 'request') {
              $scope.resquestorsersRequest.push(request);
            } else if (request.transport) {
              if (request.transport._id === userStore._id) {
                if (request.deliverystatus === 'response') {
                  $scope.resquestorsersResponse.push(request);
                } else if (request.deliverystatus === 'received') {
                  $scope.resquestorsersReceived.push(request);
                }
              }
            }

          })
          $rootScope.countResponseReq = $scope.resquestorsersRequest.length;
          $rootScope.countResponseRes = $scope.resquestorsersResponse.length;
          $rootScope.countResponseRec = $scope.resquestorsersReceived.length;
          $rootScope.ResponseReq = $scope.resquestorsersRequest;
          $rootScope.ResponseRes = $scope.resquestorsersResponse;
          $rootScope.ResponseRec = $scope.resquestorsersReceived;
        });
    }


    $scope.requestorderDetail = function (data) {
      //alert('go to detail');

      $state.go('tab.requestdetail', { data: JSON.stringify(data) });
    }

    $scope.doRefresh = function () {
      $scope.init();
      // Stop the ion-refresher from spinning
      $scope.$broadcast('scroll.refreshComplete');

    };
  })

  .controller('TransportDetailCtrl', function ($scope, RequestService, AuthService, $state, $stateParams, $ionicModal) {
    $scope.userStore = AuthService.getUser();
    $scope.data = JSON.parse($stateParams.data);
    console.log($scope.data);

    $scope.responseOrder = function (item) {
      var listord =
        {
          status: 'response',
          datestatus: new Date()
        };
      item.historystatus.push(listord);

      var status = item.deliverystatus;
      status = 'response';
      var responseorder = {
        deliverystatus: status,
        historystatus: item.historystatus,
        transport: $scope.userStore
      }
      var responseorderId = item._id;


      RequestService.updateResponseOrder(responseorderId, responseorder)
        .then(function (response) {
          // alert('success');
          $state.go('tab.transport');
        }, function (error) {
          console.log(error);
          alert('dont success' + " " + error.data.message);
        });

    };
  })

  .controller('MapCtrl', function ($scope, $rootScope, $http, $state, AuthService, RequestService, $stateParams, $cordovaGeolocation) {
    $scope.init = function () {
      $scope.readMap();
    }
    $scope.$on('onLoginSuccess', function (event, args) {
      $scope.init();
    });
    $rootScope.$on("$stateChangeSuccess", function (event, toState, toParams, fromState, fromParams) {
      // alert('ok');
      $scope.init();
    });

    $scope.readMap = function () {
      console.log('ok');
      $scope.locationRequestorders = [];
      $scope.locationResponseRes = [];
      RequestService.getResponseorder()
        .then(function (data) {
          var userStore = AuthService.getUser();
          data.forEach(function (request) {
            if (request.deliverystatus === 'request') {
              $scope.locationRequestorders.push(request);
            }
            else if (request.deliverystatus === 'response') {
              if (request.transport._id === userStore._id) {
                $scope.locationResponseRes.push(request);
              }
            }
          });
          var posOptions = { timeout: 10000, enableHighAccuracy: false };
          $cordovaGeolocation
            .getCurrentPosition(posOptions)
            .then(function (position) {
              var lat = position.coords.latitude
              var long = position.coords.longitude
              // alert(lat + ':' + long);
              var map = new google.maps.Map(document.getElementById('map'), {
                zoom: 15,
                center: new google.maps.LatLng(lat, long), //เปลี่ยนตามต้องการ
                mapTypeId: google.maps.MapTypeId.ROADMAP
              });

              //////ตำแหน่งที่ mark ปัจจุบัน///////////
              var marker = new google.maps.Marker({
                position: map.getCenter(),
                icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 15,
                  fillColor: 'blue',
                  fillOpacity: 0.2,
                  strokeColor: 'blue',
                  strokeWeight: 0
                },
                draggable: true,
                map: map
              });
              var marker = new google.maps.Marker({
                position: map.getCenter(),
                icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 10,
                  fillColor: '#1c90f3',
                  fillOpacity: 0.5,
                  strokeColor: 'white',
                  strokeWeight: 1
                },
                draggable: true,
                map: map
              });

              $scope.locationRequestorders.forEach(function (locations) {
                var product = '';
                var price = null;
                locations.items.forEach(function (pro) {
                  product += 'ชื่อสินค้า : ' + pro.product.name + '<br> ราคา : ' + pro.product.price + ' บาท จำนวน : ' + pro.qty + ' ชิ้น<br>';
                })
                var contentString = '<div>'
                  + '<label>' + locations.shipping.firstname + ' ' + locations.shipping.lastname + '</label><br>'
                  + '<p>' + locations.shipping.address + ' ' + locations.shipping.subdistrict + ' ' + locations.shipping.district + ' ' + locations.shipping.province + ' ' + locations.shipping.postcode + '<br>โทร : ' + '<a href="tel:' + locations.shipping.tel + '">' + locations.shipping.tel + '</a>' + '</p>'
                  + '<p>' + product + '</p>'
                  + '<label>' + 'ราคารวม : ' + locations.amount + ' บาท' + '</label><br>'
                  + '<label>' + 'ค่าจัดส่ง : ' + locations.deliveryamount + ' บาท' + '</label><br>'
                  + '<label>' + 'ส่วนลด : ' + locations.discountpromotion + ' บาท' + '</label><br>'
                  + '<label>' + 'รวมสุทธิ : ' + locations.totalamount + ' บาท' + '</label>'
                  + '</div>';
                var location = locations.shipping.sharelocation;
                // console.log($scope.locationConfirmed.length);
                if (location) {
                  var marker = new google.maps.Marker({
                    icon: {
                      url: ' http://res.cloudinary.com/hflvlav04/image/upload/v1486371643/riwxnxtjdfjganurw46m.png',
                      scaledSize: new google.maps.Size(32, 51),
                      // The origin for this image is (0, 0). 
                      origin: new google.maps.Point(0, 0),
                      // The anchor for this image is the base of the flagpole at (0, 32). 
                      //anchor: new google.maps.Point(0, 32)
                    },
                    position: new google.maps.LatLng(location.latitude, location.longitude),
                    map: map
                  });

                  var infowindow = new google.maps.InfoWindow({
                    content: contentString
                  });
                  marker.addListener('click', function () {
                    console.log('click');
                    infowindow.open($scope.map, this);
                  });
                }

              });
              $scope.locationResponseRes.forEach(function (locations) {
                var product = '';
                var price = null;
                locations.items.forEach(function (pro) {
                  product += 'ชื่อสินค้า : ' + pro.product.name + '<br> ราคา : ' + pro.product.price + ' บาท จำนวน : ' + pro.qty + ' ชิ้น<br>';
                })
                var contentString = '<div>'
                  + '<label>' + locations.shipping.firstname + ' ' + locations.shipping.lastname + '</label><br>'
                  + '<p>' + locations.shipping.address + ' ' + locations.shipping.subdistrict + ' ' + locations.shipping.district + ' ' + locations.shipping.province + ' ' + locations.shipping.postcode + '<br>โทร : ' + '<a href="tel:' + locations.shipping.tel + '">' + locations.shipping.tel + '</a>' + '</p>'
                  + '<p>' + product + '</p>'
                  + '<label>' + 'ราคารวม : ' + locations.amount + ' บาท' + '</label><br>'
                  + '<label>' + 'ค่าจัดส่ง : ' + locations.deliveryamount + ' บาท' + '</label><br>'
                  + '<label>' + 'ส่วนลด : ' + locations.discountpromotion + ' บาท' + '</label><br>'
                  + '<label>' + 'รวมสุทธิ : ' + locations.totalamount + ' บาท' + '</label>'
                  + '</div>';
                console.log(locations);
                var location = locations.shipping.sharelocation;
                console.log(location);
                // console.log($scope.locationConfirmed.length);
                if (location) {
                  var marker = new google.maps.Marker({
                    icon: {
                      url: 'http://res.cloudinary.com/hflvlav04/image/upload/v1486371632/sj4niz8oykdqfadnwhbo.png',
                      scaledSize: new google.maps.Size(28, 45),
                      // The origin for this image is (0, 0). 
                      origin: new google.maps.Point(0, 0),
                      // The anchor for this image is the base of the flagpole at (0, 32). 
                      // anchor: new google.maps.Point(0, 32)
                    },
                    position: new google.maps.LatLng(location.latitude, location.longitude),
                    map: map
                  });
                  var infowindow = new google.maps.InfoWindow({
                    content: contentString
                  });
                  marker.addListener('click', function () {
                    console.log('click');
                    infowindow.open($scope.map, this);
                  });
                }
              });

              $scope.map = map;
            }, function (err) {
              // error
            });

        });
    }
  })

  .controller('ChatDetailCtrl', function ($scope, $stateParams, Chats) {
    $scope.chat = Chats.get($stateParams.chatId);
  })

  .controller('AccountCtrl', function ($scope, $http, $state, AuthService, ReturnService, $ionicModal, $rootScope) {
    $scope.settings = {
      enableFriends: true
    };
    $scope.doLogOut = function () {
      AuthService.signOut();
      $state.go('login');
    };
    $scope.listreturn = function () {
      $state.go('tab.listreturn');
    }
  })

  .controller('ReturnCtrl', function ($scope, $http, $state, AuthService, ReturnService, $ionicModal, $rootScope) {

    $scope.init = function () {
      $scope.loadDataRe();
    }
    $scope.$on('onNotification', function (event, args) {
      // do what you want to do
      //alert();
      $scope.init();
    });
    $rootScope.$on("$stateChangeSuccess", function (event, toState, toParams, fromState, fromParams) {
      // alert('ok');
      $scope.init();
    });
    $scope.loadDataRe = function () {
      ReturnService.getReturnorder()
        .then(function (data) {
          var userStore = AuthService.getUser();
          $rootScope.ReResponse = data;
          $rootScope.countReResponse = 0;
          if ($rootScope.countReResponseRet) {
            $rootScope.countReResponseRet = $rootScope.countReResponseRet;
          }
          if ($rootScope.countReResponseRes) {
            $rootScope.countReResponseRes = $rootScope.countReResponseRes;
          }
          if ($rootScope.countReResponseRec) {
            $rootScope.countReResponseRec = $rootScope.countReResponseRec;
          }
          $scope.return = true;
          $scope.response = false;
          $scope.received = false;

          $scope.returnordersReturn = [];
          $scope.returnordersResponse = [];
          $scope.returnordersReceived = [];
          $rootScope.countReResponseRet = 0;
          $rootScope.countReResponseRes = 0;
          $rootScope.countReResponseRec = 0;
          angular.forEach($rootScope.ReResponse, function (returnOr) {
            if (returnOr.deliverystatus === 'return') {
              $scope.returnordersReturn.push(returnOr);
            } else if (returnOr.transport) {
              if (returnOr.transport._id === userStore._id) {
                if (returnOr.deliverystatus === 'response') {
                  $scope.returnordersResponse.push(returnOr);
                } else if (returnOr.deliverystatus === 'received') {
                  $scope.returnordersReceived.push(returnOr);
                }
              }
            }

          })
          $rootScope.countReResponseRet = $scope.returnordersReturn.length;
          $rootScope.countReResponseRes = $scope.returnordersResponse.length;
          $rootScope.countReResponseRec = $scope.returnordersReceived.length;
          $rootScope.ReResponseRet = $scope.returnordersReturn;
          $rootScope.ReResponseRes = $scope.returnordersResponse;
          $rootScope.ReResponseRec = $scope.returnordersReceived;
        });
    }


    $scope.returnorderDetail = function (data) {
      //alert('go to detail');

      $state.go('tab.returndetail', { data: JSON.stringify(data) });
    }

    $scope.doRefresh = function () {
      $scope.init();
      // Stop the ion-refresher from spinning
      $scope.$broadcast('scroll.refreshComplete');

    };
  })

  .controller('ReturnDetailCtrl', function ($scope, ReturnService, AuthService, $state, $stateParams, $ionicModal) {
    $scope.userStore = AuthService.getUser();
    $scope.data = JSON.parse($stateParams.data);
    console.log($scope.data);

    $scope.returnOrder = function (item) {
      var listord =
        {
          status: 'response',
          datestatus: new Date()
        };
      item.historystatus.push(listord);

      var status = item.deliverystatus;
      status = 'response';
      var returnorder = {
        deliverystatus: status,
        historystatus: item.historystatus,
        transport: $scope.userStore
      }
      var returnorderId = item._id;


      ReturnService.updateReturnOrder(returnorderId, returnorder)
        .then(function (response) {
          // alert('success');
          $state.go('tab.listreturn');
        }, function (error) {
          console.log(error);
          alert('dont success' + " " + error.data.message);
        });

    };
  });
