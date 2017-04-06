angular.module('starter.controllers', ['ngCordova', 'ngCordovaOauth'])

.controller('AppCtrl', function($scope, $rootScope, $ionicModal, $state, $timeout) {
  $scope.profile = $.jStorage.get('profile');
  // $rootScope.document = [];
  $scope.getprofile = function() {
    $scope.profile = $.jStorage.get('profile');
  };
  // $state.go($state.current, {}, { reload: true });
  $scope.logout = function() {
    $.jStorage.set('profile', null);
    $.jStorage.deleteKey('profile');
    $.jStorage.flush();

    if ($.jStorage.get('profile') === null) {
      $state.go('login');

    }


  };

})

.controller('LoginCtrl', function($scope, $ionicPopup, $rootScope, $state, MyServices, $ionicLoading, $cordovaOauth) {
  $scope.profile = {};
  $scope.profile = $.jStorage.get('profile');
  if ($scope.profile) {

    // console.log($rootScope.document);
    $state.go('app.task');
  }


  // $scope.login = function() {
  //   console.log("hi");
  //     $cordovaOauth.google("AIzaSyDEckQh5-njghsAhWUs1gT6qjIfmuqlpOo", ["https://www.googleapis.com/auth/urlshortener", "https://www.googleapis.com/auth/userinfo.email"]).then(function(result) {
  //         console.log(JSON.stringify(result));
  //     }, function(error) {
  //         console.log(error);
  //     });
  // }

  $scope.showAlert = function() {
    var alertPopup = $ionicPopup.alert({
      title: 'oops!',
      template: 'Sorry You have entered wrong email '

    });

    alertPopup.then(function(res) {
      console.log('Thank you for not eating my delicious ice cream cone');
      // $state.go('app.task');
    });
  };
  $scope.formData = {};
  $scope.validEmail = /^[a-z]+[@][a-z]+[.]+[a-z]*$/;
  $scope.login = function(email) {
    $scope.showLoading('Please wait...', 10000);
    $.jStorage.set('profile', null);
    $.jStorage.deleteKey('profile');
    $.jStorage.flush();
    MyServices.Login(email, function(data) {
      if (data.value) {
        $scope.hideLoading();
        $rootScope.taskpending = [];
        $.jStorage.set('profile', data.data);
        $state.go('app.task');
      } else {
        $scope.hideLoading();
        $scope.showAlert();
      }
    });
  };
  $scope.showLoading = function(value, time) {
    $ionicLoading.show({
      template: value,
      duration: time
    });
  };
  $scope.hideLoading = function() {
    $ionicLoading.hide();
  };
})

.controller('TaskCtrl', function($scope, $ionicPopup, $state, $rootScope, $cordovaFileTransfer, $cordovaNetwork, MyServices, $timeout, $ionicLoading) {
  $scope.task = [];
  // $rootScope.task = {};
  $scope.photos = {};
  $scope.doc = {};
  $scope.jir = {};
  $scope.photos1 = [];
  $scope.doc1 = [];
  $scope.jir1 = [];
  $rootScope.isOnline = false;
  $rootScope.shouldUpload = true;

  // console.log($rootScope.document);
  // $scope.taskpending = $.jStorage.get('taskpending');
  // console.log($scope.taskpending);
  document.addEventListener("deviceready", function() {

    var type = $cordovaNetwork.getNetwork();

    $rootScope.isOnline = $cordovaNetwork.isOnline();

    var isOffline = $cordovaNetwork.isOffline();

    $scope.taskcomplete = [];
    $scope.taskIncomplete = [];
    $rootScope.shouldUpload = true;
    // listen for Online event
    $rootScope.$on('$cordovaNetwork:online', function(event, networkState) {
      $rootScope.taskpending = $.jStorage.get('taskpending');
      console.log($rootScope.taskpending);
      var onlineState = networkState;
      if ($rootScope.shouldUpload) {
        $rootScope.shouldUpload = false;
        async.eachSeries(_.cloneDeep($rootScope.taskpending), function(value, callback) {
          uploadData(value, function(err, data) {
            if (err) {
              callback(err);
            } else {
              $rootScope.taskpending.shift();
              callback(null, data);
            }
          });
        }, function(err, data) {
          $.jStorage.set('taskpending', []);
          $rootScope.shouldUpload = true;
          callback(null, data);
          $scope.doRefresh();
        });
      }
      // $scope.taskfun();
      // $scope.doRefresh();
    });

    // listen for Offline event
    $rootScope.$on('$cordovaNetwork:offline', function(event, networkState) {
      $rootScope.taskpending = [];
      $rootScope.taskpending = $.jStorage.get('taskpending');
      console.log($rootScope.taskpending);

      var offlineState = networkState;
      console.log(offlineState);
      $scope.doRefresh();
    });

  }, false);

  function uploadData(value, callback) {
    $scope.document = value;
    console.log(value);
    console.log($scope.document);
    $scope.photos = _.cloneDeep($scope.document.photos);
    $scope.doc = _.cloneDeep($scope.document.doc);
    $scope.jir = _.cloneDeep($scope.document.jir);
    console.log($scope.photos);
    console.log($scope.doc);
    console.log($scope.jir);
    async.parallel({
      photos: function(callback) {
        async.each(_.flatten($scope.photos), function(value, callback) {
          console.log(value);
          uploadImage(value, 'photos', callback);

        }, function(err, data) {
          callback(null, data);
        });
      },
      document: function(callback) {
        async.each(_.flatten($scope.doc), function(value, callback) {
          console.log(value);
          uploadImage(value, 'Document', callback);

        }, function(err, data) {
          callback(null, data);
        });
      },
      jir: function(callback) {
        async.each(_.flatten($scope.jir), function(value, callback) {
          console.log(value);
          uploadImage(value, 'JIR', callback);

        }, function(err, data) {
          callback(null, data);
        });
      }
    }, function(err, data) {
      $scope.document.photos = [];
      $scope.document.doc = [];
      $scope.document.jir = [];
      $scope.document.photos.length = 0;
      console.log("done");
      // $scope.photos1 = _.flatten($scope.photos);
      _.forEach($scope.photos1, function(value) {
        $scope.document.photos.push({
          "file": value
        });
      });
      //doc
      $scope.document.doc.length = 0;
      // $scope.doc1 = _.flatten($scope.doc);
      _.forEach($scope.doc1, function(value) {
        $scope.document.doc.push({
          "file": value
        });
      });
      //jir
      $scope.document.jir.length = 0;
      // $scope.jir1 = _.flatten($scope.jir)
      _.forEach($scope.jir1, function(value) {
        $scope.document.jir.push({
          "file": value
        });
      });
      console.log("hry", $scope.document);
      MyServices.mobileSubmit($scope.document, function(data) {
        if (data.value) {
          console.log(data);
          $scope.taskcomplete.push($scope.document);
          $scope.photos = [];
          $scope.doc = [];
          $scope.jir = [];
          $scope.photos1 = [];
          $scope.doc1 = [];
          $scope.jir1 = [];
          // _.remove($rootScope.document, function(n) {
          //   return  n.assignId==$scope.document.assignId;
          // });
          $rootScope.taskpending.shift();
          callback(null, $scope.taskcomplete);
        } else {
          console.log(data.value);
          callback(null, data);
        }
      });

    });

  }

  $scope.taskfun = function() {
    console.log("online status", $rootScope.isOnline);
    // if ($rootScope.isOnline) {
      //
      // $rootScope.taskpending = $.jStorage.get('taskpending');
      console.log($rootScope.taskpending);

      // var onlineState = networkState;
      if (_.isEmpty($rootScope.taskpending)) {

        console.log("empty", $rootScope.taskpending);
        // $scope.doRefresh();
        $scope.profile = {};
        $scope.id = {};
        $scope.profile = $.jStorage.get('profile');
        $scope.id = null;
        $scope.id = $scope.profile._id;
        // $scope.task = [];
        MyServices.Task($scope.id, function(data) {
          $scope.task = [];
          console.log($scope.id);
          $scope.notask = false;
          console.log(data.data.length);
          if (data.data.length === 0) {
            $scope.notask = true;
            console.log(data);
          }
          if (data.value) {
            console.log(data);
            $.jStorage.set('task', data.data);
            $scope.task = $.jStorage.get('task');
            $.jStorage.set('taskpending', []);
            $scope.offtask();
          } else {
            // $scope.showAlert();
            $scope.notask = true;
          }
        });
      }
       else {
        if ($rootScope.isOnline) {
          $rootScope.shouldUpload = true;

          if ($rootScope.shouldUpload) {

          $rootScope.shouldUpload = false;
          // debugger;
          async.eachSeries(_.cloneDeep($rootScope.taskpending), function(value, callback) {
            uploadData(value, function(err, data) {
              if (err) {
                callback(err);
              } else {
                // $rootScope.taskpending.shift();
                console.log("$rootScope.taskpending", $rootScope.taskpending);
                callback(null, data);
              }
            });
          }, function(err, data) {
            $rootScope.shouldUpload = true;
            // $scope.doRefresh();
            $.jStorage.set('taskpending', []);
            $scope.profile = {};
            $scope.id = {};
            $scope.profile = $.jStorage.get('profile');
            $scope.id = null;
            $scope.id = $scope.profile._id;
            // $scope.task = [];
            MyServices.Task($scope.id, function(data) {
              $scope.task = [];
              console.log($scope.id);
              $scope.notask = false;
              console.log(data.data.length);
              if (data.data.length === 0) {
                $scope.notask = true;
                console.log(data);
              }
              if (data.value) {
                console.log(data);
                $.jStorage.set('task', data.data);
                $scope.task = $.jStorage.get('task');
                $.jStorage.set('taskpending', []);
                $scope.offtask();
              } else {
                // $scope.showAlert();
                $scope.notask = true;
              }
            });
            // callback(null, data);
          });

          // $scope.doRefresh();
        }
      }}

    // }

  };
  $scope.offtask = function() {
    $scope.task = $.jStorage.get('task');
    if ($scope.task) {
      $rootScope.taskpending = $.jStorage.get('taskpending');

      console.log("i am in the offline man");
      if (_.isArray($rootScope.taskpending) && _.isArray($scope.task)) {
        var i = 0;
        _.each($rootScope.taskpending, function(values) {
          var val1 = values.assignId.toString();
          var val2 = $scope.task[i]._id;
          if (val1 == val2) {
            $scope.task[i].status = true;
          } else {
            $scope.task[i].status = false;
          }
          i++;
        });
      }
      $.jStorage.set('task', $scope.task);

      var
        monthLabels = ["Jan", "Feb", "March",
          "April", "May", "June",
          "July", "Aug", "Sep",
          "Oct", "Nov", "Dec"
        ];
      var items = $scope.task;
      console.log(items);
      var itemsGroupedByMonth = function(items) {
        var
          groups = [
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
          ],
          itemGroupedByMonths = [];

        for (var i = 0; i < items.length; i++) {
          groups[new Date(items[i].surveyDate).getMonth()].push(items[i]);
        }
        console.log(groups);
        for (var i = 0; i < groups.length; i++) {
          if (groups[i].length) {
            itemGroupedByMonths.push({
              month: monthLabels[i],
              items: groups[i]
            });
          }
        }
        return itemGroupedByMonths;

      };

      $scope.monthWiseGroup = itemsGroupedByMonth(items);
      console.log($scope.monthWiseGroup);
    }
  };
  $scope.offtask();
  // $scope.taskfun();
  $scope.doRefresh = function() {

    console.log('Refreshing!');
    $timeout(function() {
      //simulate async response
      if ($cordovaNetwork.isOnline()) {
        $scope.taskfun();
      } else {
        $scope.offtask();
      }
      //Stop the ion-refresher from spinning
      $scope.$broadcast('scroll.refreshComplete');
    }, 1000);
  };
  $scope.show = function() {
    $ionicLoading.show({
      template: 'Loading...',
      duration: 3000
    }).then(function() {
      console.log("The loading indicator is now displayed");
    });
  };
  $scope.hide = function() {
    $ionicLoading.hide().then(function() {
      console.log("The loading indicator is now hidden");
    });
  };
  $scope.decline = {};
  $scope.declinetask = function(surveyId, assignId, message) {
    $scope.show();
    $scope.decline.surveyId = surveyId;
    $scope.decline.assignId = assignId;
    $scope.decline.empId = $scope.id;
    $scope.decline.message = message;
    console.log($scope.decline);
    //  $scope.decline.empMail =$scope.profile.mai;
    MyServices.Decline($scope.decline, function(data) {
      if (data.value) {
        $scope.hide();
        console.log(data);
        $scope.doRefresh();
      }
    });
  };

  //upload image----------------------------------------------------------------
  // $scope.uploadImage = function (imageURI, arrayName, callback) {
  function uploadImage(imageURI, arrayName, callback) {
    console.log('imageURI', imageURI);
    // $scope.showLoading('Uploading Image...', 10000);
    $cordovaFileTransfer.upload(adminurl + 'upload', imageURI)
      .then(function(result) {
        // Success!
        // $scope.hideLoading();
        result.response = JSON.parse(result.response);
        console.log(result.response.data[0]);

        if (arrayName === 'photos') {
          // $scope.photos = _.flatten($scope.photos);
          $scope.photos1.push(result.response.data[0]);
          console.log($scope.photos1);
          // $scope.photos = _.chunk($scope.photos, 3);
        } else if (arrayName === 'Document') {
          // $scope.doc = _.flatten($scope.doc);
          $scope.doc1.push(result.response.data[0]);
          console.log($scope.doc1);
          // $scope.doc = _.chunk($scope.doc, 3);
        } else {
          // $scope.jir = _.flatten($scope.jir);
          $scope.jir1.push(result.response.data[0]);
          console.log($scope.jir1);
          // $scope.jir = _.chunk($scope.jir, 3);
        }
        callback(null, result);
      }, function(err) {
        console.log(err);
        // Error
      }, function(progress) {
        // console.log(err);
        // constant progress updates
      });
  };

  $scope.information = function(index, parent) {

    console.log($scope.monthWiseGroup[parent].items[index], 'inside match');
    $scope.insideData = $scope.monthWiseGroup[parent].items[index];
    console.log(index, 'index');
    $scope.insideData.surveyDate = new Date($scope.monthWiseGroup[parent].items[index].surveyDate);
    console.log($scope.insideData.surveyDate);
    $scope.infos = $ionicPopup.show({
      templateUrl: 'templates/modal/info.html',
      scope: $scope,

    });
  };
  $scope.closePopup = function() {
    $scope.infos.close();
  };

  $scope.showPopup = function(surveyId, assignId) {
    $scope.data = {};

    // An elaborate, custom popup
    var myPopup = $ionicPopup.show({
      template: '<textarea placeholder="Reason" ng-model="data.message" class="decline-input"></textarea>',
      title: 'Please submit the reason for decline the task',
      cssClass: 'declinepop',
      // subTitle: 'Please use normal things',
      scope: $scope,
      buttons: [{
        text: 'Cancel'
      }, {
        text: '<b>Submit</b>',
        type: 'button-positive',
        onTap: function(e) {
          if (!$scope.data.message) {
            //don't allow the user to close unless he enters wifi password
            e.preventDefault();
          } else {
            $scope.declinetask(surveyId, assignId, $scope.data.message);

          }
        }
      }]
    });

    myPopup.then(function(res) {
      console.log('Tapped!', res);
    });

    // $timeout(function() {
    //    myPopup.close(); //close the popup after 3 seconds for some reason
    // }, 10000);
  };
  // $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
  //   $scope.task = [];
  //   console.log("GOOD");
  //   $timeout(function() {
  //     $scope.doRefresh();
  //   }, 300);
  // });

  $scope.showAlert = function(text) {
    var alertPopup = $ionicPopup.alert({
      template: text
    });
    alertPopup.then(function(res) {
      // $state.go('app.task');
    });
  };

})

.controller('PhotosDocumentsCtrl', function($scope, $cordovaCamera, $ionicLoading, $cordovaNetwork, $ionicModal, $ionicActionSheet, $cordovaFileTransfer, $state, $stateParams, $ionicPopup, $rootScope, MyServices, $cordovaImagePicker) {
  //initialize all objects start-----------------------------------------------
  $scope.photos = [];
  $scope.doc = [];
  $scope.jir = [];
  $scope.photos1 = [];
  $scope.doc1 = [];
  $scope.jir1 = [];
  $scope.document = {};
  $scope.surveyform = {};
  $scope.profile = $.jStorage.get('profile');
  // console.log($scope.profile);
  // console.log($scope.profile._id);
  $scope.document.empId = $scope.profile._id;
  $scope.document.assignId = $stateParams.assignId;
  $scope.document.surveyId = $stateParams.surveyId;
  $scope.newUser = {};
  $scope.newUser.surveyDate = new Date();
  //initialize all objects end------------------------------------------------------

  //picture upload action sheet popup--------------------------------------------
  $scope.showActionsheet = function(arrayName) {
    console.log(arrayName);
    $ionicActionSheet.show({
      //  titleText: 'choose option',
      buttons: [{
        text: '<i class="icon ion-ios-camera-outline"></i> Choose from gallery'
      }, {
        text: '<i class="icon ion-images"></i> Take from camera'
      }, ],
      //  destructiveText: 'Delete',
      cancelText: 'Cancel',
      cancel: function() {
        console.log('CANCELLED');
      },
      buttonClicked: function(index) {
        console.log('BUTTON CLICKED', index);
        if (index === 0) {
          $scope.getImageSaveContact(arrayName);
        } else {
          $scope.openCamera(arrayName);
        }
        return true;
      },
      destructiveButtonClicked: function() {
        console.log('DESTRUCT');
        return true;
      }
    });
  };

  //picture upload action sheet popup--------------------------------------------
  $scope.showActionsheet = function(arrayName) {
    console.log(arrayName);
    $ionicActionSheet.show({
      //  titleText: 'choose option',
      buttons: [{
        text: '<i class="icon ion-ios-camera-outline"></i> Choose from gallery'
      }, {
        text: '<i class="icon ion-images"></i> Take from camera'
      }, ],
      //  destructiveText: 'Delete',
      cancelText: 'Cancel',
      cancel: function() {
        console.log('CANCELLED');
      },
      buttonClicked: function(index) {
        console.log('BUTTON CLICKED', index);
        if (index === 0) {
          $scope.getImageSaveContact(arrayName);
        } else {
          $scope.openCamera(arrayName);
        }
        return true;
      },
      destructiveButtonClicked: function() {
        console.log('DESTRUCT');
        return true;
      }
    });
  };

  //take image from camera --------------------------------------------------------
  $scope.openCamera = function(arrayName) {
    console.log(arrayName);

    var cameraOptions = {
      quality: 90,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.CAMERA,
      allowEdit: false,
      encodingType: 0,
      targetWidth: 1200,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: true,
      correctOrientation: true
    };
    $cordovaCamera.getPicture(cameraOptions).then(function(imageData) {
      $scope.imageSrc = "data:image/jpeg;base64," + imageData;
      console.log(arrayName);

      if (arrayName === 'photos') {
        $scope.photos = _.flatten($scope.photos);
        // $scope.uploadImage($scope.imageSrc, arrayName);
        $scope.photos.push($scope.imageSrc);
        $scope.photos = _.chunk($scope.photos, 3);
      } else if (arrayName === 'Document') {
        $scope.doc = _.flatten($scope.doc);
        $scope.doc.push($scope.imageSrc);
        // $scope.uploadImage($scope.imageSrc, arrayName);
        $scope.doc = _.chunk($scope.doc, 3);
      } else {
        $scope.jir = _.flatten($scope.jir);
        $scope.jir.push($scope.imageSrc);
        // $scope.uploadImage($scope.imageSrc, arrayName);
        $scope.jir = _.chunk($scope.jir, 3);
      }
    }, function(err) {

      console.log(err);
    });
  };

  //cordovaImagePicker function------------------------------------------------------
  $scope.getImageSaveContact = function(arrayName) {
    console.log(arrayName);
    // Image picker will load images according to these settings
    var options = {
      maximumImagesCount: 20, // Max number of selected images
      width: 800,
      height: 800,
      quality: 80 // Higher is better
    };
    $cordovaImagePicker.getPictures(options).then(function(results) {
      console.log(results);
      console.log(arrayName);
      if (arrayName === 'photos') {
        $scope.photos = _.flatten($scope.photos);
        // _.forEach(results, function(value) {
        //   $scope.uploadImage(value, arrayName);
        // });
        _.forEach(results, function(value) {
          $scope.photos.push(value);
        });
        $scope.photos = _.chunk($scope.photos, 3);
      } else if (arrayName === 'Document') {
        $scope.doc = _.flatten($scope.doc);
        // _.forEach(results, function(value) {
        //   $scope.uploadImage(value, arrayName);
        // });
        _.forEach(results, function(value) {
          $scope.doc.push(value);
        });
        $scope.doc = _.chunk($scope.doc, 3);
      } else {
        $scope.jir = _.flatten($scope.jir);
        // _.forEach(results, function(value) {
        //   $scope.uploadImage(value, arrayName);
        // });
        _.forEach(results, function(value) {
          $scope.jir.push(value);
        });
        $scope.jir = _.chunk($scope.jir, 3);
      }
    }, function(error) {
      console.log('Error: ' + JSON.stringify(error)); // In case of error
    });
  };


  //remove image from array-----------------------------------------------------
  $scope.showConfirm = function(image, arrayName) {
    var confirmPopup = $ionicPopup.confirm({
      template: ' Are you sure you want to remove this?',
      cssClass: 'remove'
    });
    confirmPopup.then(function(res) {
      if (res) {
        console.log('You are sure');
        if (arrayName === 'photos') {
          $scope.photos = _.flatten($scope.photos);
          _.remove($scope.photos, function(n) {
            return n === image;
          });
          $scope.photos = _.chunk($scope.photos, 3);
          console.log($scope.photos);
        } else if (arrayName === 'Document') {
          $scope.doc = _.flatten($scope.doc);
          _.remove($scope.doc, function(n) {
            return n === image;
          });
          $scope.doc = _.chunk($scope.doc, 3);
          console.log($scope.doc);

        } else {
          $scope.jir = _.flatten($scope.jir);
          _.remove($scope.jir, function(n) {
            return n === image;
          });
          $scope.jir = _.chunk($scope.jir, 3);
          console.log($scope.jir);
        }
      } else {
        console.log('You are not sure');
      }
    });
  };

  //survey form modal --------------------------------------------------------------
  $ionicModal.fromTemplateUrl('templates/modal/survey-form.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  //survey popup close----------------------------------------------------------
  $scope.surveyClose = function() {
    $scope.survey.close();
  };

  // alert popup for all---------------------------------------------------------
  $scope.showAlert = function(text) {
    var alertPopup = $ionicPopup.alert({
      template: text
    });
    alertPopup.then(function(res) {
      // $state.go('app.task');
    });
  };

  //survey form open popup-------------------------------------------------------------------
  $scope.surveyOpen = function() {
    $scope.msg = false;
    $scope.msgSub = false;
    if (!(_.isEmpty($scope.photos) && _.isEmpty($scope.doc) && _.isEmpty($scope.jir))) {
      if (!(_.isEmpty($scope.jir))) {
        // //photos
        //   $scope.document.photos = [];
        //   $scope.photos1 = _.flatten($scope.photos);
        //   _.forEach($scope.photos1, function(value) {
        //     $scope.document.photos.push({
        //       "file": value
        //     });
        //   });
        //   //doc
        //   $scope.document.doc = [];
        //   $scope.doc1 = _.flatten($scope.doc);
        //   _.forEach($scope.doc1, function(value) {
        //     $scope.document.doc.push({
        //       "file": value
        //     });
        //   });
        //   //jir
        //   $scope.document.jir = [];
        //   $scope.jir1 = _.flatten($scope.jir);
        //
        //   _.forEach($scope.jir1, function(value) {
        //     $scope.document.jir.push({
        //       "file": value
        //     });
        //   });
        $scope.survey = $ionicPopup.show({
          templateUrl: 'templates/modal/survey-form.html',
          scope: $scope,
        });

      } else {
        $scope.showAlert('Please add JIR ');
      }

    } else {
      $scope.showAlert('Please add attachments ');
    }
  };


  //loader function-------------------------------------------------------------
  $scope.showLoading = function(value, time) {
    $ionicLoading.show({
      template: value,
      duration: time
    });
  };
  $scope.hideLoading = function() {
    $ionicLoading.hide();
  };

  //task submit api ------------------------------------------------------------------------
  $scope.mobileSubmit = function(newuser) {
    // $scope.surveyform = newuser;
    $scope.document = newuser;
    $scope.msgSub = true;

    // $scope.document.surveyDate = $scope.surveyform.surveyDate;
    // $scope.document.startTime = $scope.surveyform.startTime;
    // $scope.document.endTime = $scope.surveyform.endTime;
    // $scope.document.address = $scope.surveyform.address;
    // _.forEach($scope.document.photos, function (value) {
    //   $scope.photos.push(
    //     value
    //   );
    // });
    // _.forEach($scope.document.doc, function (value) {
    //   $scope.doc.push(
    //     value
    //   );
    // });
    // _.forEach($scope.document.jir, function (value) {
    //   $scope.jir.push(
    //     value
    //   );
    // });

    $scope.document.photos = {};
    $scope.document.doc = {};
    $scope.document.jir = {};
    $scope.document.photos = _.clone($scope.photos);
    $scope.document.doc = _.clone($scope.doc);
    $scope.document.jir = _.clone($scope.jir);
    $scope.document.empId = $scope.profile._id;
    $scope.document.assignId = $stateParams.assignId;
    $scope.document.surveyId = $stateParams.surveyId;
    console.log($scope.document);
    $scope.showLoading('Please wait...', 15000);
    //
    // if ($cordovaNetwork.isOnline()) {
    //   uploadData();
    // } else {

    $rootScope.taskpending.push($scope.document);
    $.jStorage.set('taskpending', $rootScope.taskpending);
    $scope.msg = true;
    $scope.hideLoading();
    $scope.msgSub = true;

    //
    // }
  };

  function uploadData() {
    console.log($scope.photos);
    console.log($scope.doc);
    console.log($scope.jir);
    async.parallel({
      photos: function(callback) {
        async.each(_.flatten($scope.photos), function(value, callback) {
          console.log(value);
          $scope.uploadImage(value, 'photos', callback);

        }, function(err, data) {
          callback(null, data);
        });
      },
      document: function(callback) {
        async.each(_.flatten($scope.doc), function(value, callback) {
          console.log(value);
          $scope.uploadImage(value, 'Document', callback);

        }, function(err, data) {
          callback(null, data);
        });
      },
      jir: function(callback) {
        async.each(_.flatten($scope.jir), function(value, callback) {
          console.log(value);
          $scope.uploadImage(value, 'JIR', callback);

        }, function(err, data) {
          callback(null, data);
        });
      }
    }, function(err, data) {

      console.log($scope.photos1);
      console.log($scope.doc1);
      console.log($scope.jir1);
      //
      $scope.document.photos = [];
      $scope.document.doc = [];
      $scope.document.jir = [];
      $scope.document.photos.length = 0;

      // $scope.photos1 = _.flatten($scope.photos);
      _.forEach($scope.photos1, function(value) {
        $scope.document.photos.push({
          "file": value
        });
      });
      //doc
      $scope.document.doc.length = 0;
      // $scope.doc1 = _.flatten($scope.doc);
      _.forEach($scope.doc1, function(value) {
        $scope.document.doc.push({
          "file": value
        });
      });
      //jir
      $scope.document.jir.length = 0;
      // $scope.jir1 = _.flatten($scope.jir)
      _.forEach($scope.jir1, function(value) {
        $scope.document.jir.push({
          "file": value
        });
      });
      MyServices.mobileSubmit($scope.document, function(data) {

        if (data.value) {
          $scope.hideLoading();
          console.log(data);
          $scope.msg = true;
          $scope.msgSub = true;

          // $scope.surveyClose();
          // $state.go('app.task');
        } else {
          console.log(data.value);
          $scope.hideLoading();
        }
      });
    });



  }

  //msg----------------------------------------------------------------------00

  $scope.msgsubmit = function() {
    $scope.surveyClose();
    $state.go('app.task');
  };
  //upload image----------------------------------------------------------------
  $scope.uploadImage = function(imageURI, arrayName, callback) {
    console.log('imageURI', imageURI);
    // $scope.showLoading('Uploading Image...', 10000);
    $cordovaFileTransfer.upload(adminurl + 'upload', imageURI)
      .then(function(result) {
        // Success!
        // $scope.hideLoading();
        result.response = JSON.parse(result.response);
        console.log(result.response.data[0]);

        if (arrayName === 'photos') {
          // $scope.photos = _.flatten($scope.photos);
          $scope.photos1.push(result.response.data[0]);
          console.log($scope.photos1);
          // $scope.photos = _.chunk($scope.photos, 3);
        } else if (arrayName === 'Document') {
          // $scope.doc = _.flatten($scope.doc);
          $scope.doc1.push(result.response.data[0]);
          console.log($scope.doc1);
          // $scope.doc = _.chunk($scope.doc, 3);
        } else {
          // $scope.jir = _.flatten($scope.jir);
          $scope.jir1.push(result.response.data[0]);
          console.log($scope.jir1);
          // $scope.jir = _.chunk($scope.jir, 3);
        }
        callback(null, result);
      }, function(err) {
        // Error
      }, function(progress) {
        // constant progress updates
      });
  };



})

.controller('EmergencyCtrl', function($scope) {})

.controller('SurveyCtrl', function($scope, $ionicScrollDelegate) {
  $scope.toggleGroup = function(group) {
    if ($scope.isGroupShown(group)) {
      $scope.shownGroup = null;
    } else {
      $scope.shownGroup = group;
    }
    $ionicScrollDelegate.resize();
    $ionicScrollDelegate.$getByHandle('mainScroll').scrollTop();
  };
  $scope.isGroupShown = function(group) {
    return $scope.shownGroup === group;
  };
});
