/* global angular, document, window */
'use strict';

angular.module('starter.controllers', ["firebase"])
    .constant('FBURL', 'https://jarvis-8288f.firebaseio.com/')

.factory('Auth', function($firebaseAuth, FBURL, $window) {
    //var ref = new $window.Firebase(FBURL);
    return $firebaseAuth();
})

.factory('Messages', function($firebaseObject, $firebaseArray, FBURL, $window) {
        var ref = firebase.database().ref().child("iot");
        return $firebaseObject(ref);
    })
    .controller('AppCtrl', function($scope, $ionicModal, $ionicPopover, $timeout) {
        // Form data for the login modal
        $scope.loginData = {};
        $scope.isExpanded = false;
        $scope.hasHeaderFabLeft = false;
        $scope.hasHeaderFabRight = false;

        var navIcons = document.getElementsByClassName('ion-navicon');
        for (var i = 0; i < navIcons.length; i++) {
            navIcons.addEventListener('click', function() {
                this.classList.toggle('active');
            });
        }

        ////////////////////////////////////////
        // Layout Methods
        ////////////////////////////////////////

        $scope.hideNavBar = function() {
            document.getElementsByTagName('ion-nav-bar')[0].style.display = 'none';
        };

        $scope.showNavBar = function() {
            document.getElementsByTagName('ion-nav-bar')[0].style.display = 'block';
        };

        $scope.noHeader = function() {
            var content = document.getElementsByTagName('ion-content');
            for (var i = 0; i < content.length; i++) {
                if (content[i].classList.contains('has-header')) {
                    content[i].classList.toggle('has-header');
                }
            }
        };

        $scope.setExpanded = function(bool) {
            $scope.isExpanded = bool;
        };

        $scope.setHeaderFab = function(location) {
            var hasHeaderFabLeft = false;
            var hasHeaderFabRight = false;

            switch (location) {
                case 'left':
                    hasHeaderFabLeft = true;
                    break;
                case 'right':
                    hasHeaderFabRight = true;
                    break;
            }

            $scope.hasHeaderFabLeft = hasHeaderFabLeft;
            $scope.hasHeaderFabRight = hasHeaderFabRight;
        };

        $scope.hasHeader = function() {
            var content = document.getElementsByTagName('ion-content');
            for (var i = 0; i < content.length; i++) {
                if (!content[i].classList.contains('has-header')) {
                    content[i].classList.toggle('has-header');
                }
            }

        };

        $scope.hideHeader = function() {
            $scope.hideNavBar();
            $scope.noHeader();
        };

        $scope.showHeader = function() {
            $scope.showNavBar();
            $scope.hasHeader();
        };

        $scope.clearFabs = function() {
            var fabs = document.getElementsByClassName('button-fab');
            if (fabs.length && fabs.length > 1) {
                fabs[0].remove();
            }
        };
    })

.controller('LoginCtrl', function($window, Auth, $scope, $timeout, $stateParams, ionicMaterialInk) {
    $scope.$parent.clearFabs();
    $scope.signIn = function() {
        Auth.$signInWithPopup("facebook").then(function(firebaseUser) {
            console.log("Signed in as:", firebaseUser);
            $window.localStorage['accessToken'] = firebaseUser.credential.accessToken;
        }).catch(function(error) {
            console.log("Authentication failed:", error);
        });

    }
    $timeout(function() {
        $scope.$parent.hideHeader();
    }, 0);
    ionicMaterialInk.displayEffect();
})

.controller('FriendsCtrl', function(Auth, $window, Messages, $firebaseArray, $scope, $stateParams, $timeout, ionicMaterialInk, ionicMaterialMotion, $http) {
    // Set Header
    var loc;
    //console.log(Messages);
    navigator.geolocation.getCurrentPosition(function(position) {
        loc = position.coords.latitude + "," + position.coords.longitude;

        console.log(loc);
        var wurl = "http://dataservice.accuweather.com/locations/v1/cities/geoposition/search";

        /*
        $http.get(wurl, wconfig).then(function(response) {
            console.log(response);
        }, function(response) {});
        */
        $.ajax({
            url: wurl,
            jsonp: "callback",
            dataType: "jsonp",
            data: {
                'apikey': 'c6CDkKcUXAATCr3whJgGuiim22gVEea2',
                'q': loc
            },
            success: function(response) {
                console.log(response);

                $.ajax({
                    url: "http://dataservice.accuweather.com/currentconditions/v1/" + response.Key,
                    jsonp: "callback",
                    dataType: "jsonp",
                    data: {
                        'apikey': 'c6CDkKcUXAATCr3whJgGuiim22gVEea2'
                    },
                    success: function(responsex) {
                        console.log(responsex);
                        console.log(response.LocalizedName);
                        console.log(responsex[0].Temperature.Metric.Value); // server response
                        artyom.say("the weather at our home " + response.LocalizedName + "is " + responsex[0].Temperature.Metric.Value + "degrees centigrade");
                    }
                });
            }
        });
    });

    Messages.$bindTo($scope, "l1")
        .then(function() {
            if (annyang) {
                console.log("annyang is working ");
                console.log($scope.l1);

                // Let's define a command.
                var commands = {
                    'ok *tag': function(tag) {
                        console.log(tag);


                        var accessToken = "3989c9f7e9bc4d67a94dd6caf0581888";
                        var baseUrl = "https://api.api.ai/v1/";
                        var text = tag;
                        $.ajax({
                            type: "POST",
                            url: baseUrl + "query?v=20150910",
                            contentType: "application/json; charset=utf-8",
                            dataType: "json",
                            headers: {
                                "Authorization": "Bearer " + accessToken
                            },
                            data: JSON.stringify({ query: text, lang: "en", sessionId: "somerandomthing" }),
                            success: function(data) {
                                console.log(data);
                                setResponse(data);
                            },
                            error: function(err) {
                                console.log(err);
                                setResponse("Internal Server Error");
                            }
                        });
                        setResponse("Loading...");

                        function setResponse(val) {
                            if (val.result.action == "iot") {
                                if (val.result.parameters.status == "on") {
                                    if($scope.l1.Bedroom.x1.status != 1){
                                    $scope.l1.Bedroom.x1.status = 1;
                                    artyom.say("command accepted Turning on the lights sir");
                                    $scope.$apply();
                                    }
                                    else{
                                        artyom.say("sir, the lights are already turned on");
                                    }
                                    
                                }
                                else{
                                    if($scope.l1.Bedroom.x1.status != 0){
                                    $scope.l1.Bedroom.x1.status = 0;
                                    artyom.say("command accepted Turning off the lights sir");
                                    $scope.$apply(); 
                                    }
                                    else{
                                        artyom.say("sir, the lights are already turned off");
                                    }  
                                }
                            }
                            if (val.result.action == "weatherPlace") {
                                console.log("sending to accuweather");
                                $.ajax({
                                    url: "http://dataservice.accuweather.com/locations/v1/cities/autocomplete",
                                    jsonp: "callback",
                                    dataType: "jsonp",
                                    data: {
                                        'apikey': 'c6CDkKcUXAATCr3whJgGuiim22gVEea2',
                                        'q': val.result.parameters.place
                                    },
                                    success: function(response) {
                                        console.log(response);
                                        console.log(response[0].LocalizedName);
                                        var place = response[0].LocalizedName;
                                        $.ajax({
                                            url: "http://dataservice.accuweather.com/currentconditions/v1/" + response[0].Key,
                                            jsonp: "callback",
                                            dataType: "jsonp",
                                            data: {
                                                'apikey': 'c6CDkKcUXAATCr3whJgGuiim22gVEea2'
                                            },
                                            success: function(response) {
                                                console.log(response);
                                                console.log(response[0].Temperature.Metric.Value);
                                                // server response
                                                artyom.say("Currently the weather at " + place + "is a bit " + response[0].WeatherText + "with " + response[0].Temperature.Metric.Value + "degrees centrigrade")
                                            }
                                        });
                                    }
                                });
                            }
                        }
                    },

                    'hello': function() {
                        console.log('speaked is hello');
                        artyom.say("Hello welcome master jash");
                    },
                    'tell me about yourself': function() { artyom.say("i am jarvis.a virtual artificial intelligence.and i am here to assist to with a variety of tasks as best i can .24 hours a day seven days a week.i am a personal assistant found throughout your home and Android device. i can wake you up everyday with weather and keep u up notified with stocks.My basic features includes Home Automation - Energy Savings Efficiency - Voice Recognition and Speech Synthesis - Enhance Security and Safety - Entire House Wide Virtual Assistant and many.i am capable of reading notifications, cellular messages, social network news feeds and so much more. and can even reply to those messages for you if you tell me what to say. "); },
                    'good evening': function() { artyom.say("good evening sir"); },
                    'good morning': function() { artyom.say("good morning sir"); },
                    'light on': function() {
                        console.log('turning on light');
                        $scope.l1.Bedroom.x1.status = 1;
                        artyom.say("command accepted Turning on the lights sir");
                        $scope.$apply();
                        console.log($scope.l1.Bedroom.x1);
                    },
                    'notifications': function() {
                        console.log('showing notifications');
                        $.ajax({
                            type: "GET",
                            url: "http://localhost:4000/fbnotifications",
                            contentType: "application/json; charset=utf-8",
                            dataType: "json",
                            headers: {
                                //"Authorization": "Bearer " + accessToken
                            },
                            //data: JSON.stringify({ query: text, lang: "en", sessionId: "somerandomthing" }),
                            success: function(data) {
                                console.log(data);
                            },
                            error: function() {
                                //setResponse("Internal Server Error");
                            }
                        });
                    },
                    'light off': function() {
                        console.log('turning off light');
                        $scope.l1.Bedroom.x1.status = '0';
                        artyom.say("command accepted Turning off the lights sir");
                        $scope.$apply();
                    }
                };

                // Add our commands to annyang
                annyang.addCommands(commands);

                // Start listening.
                annyang.start({ continuous: false });
            }
        })
    $scope.fbtest = function() {
        var token = $window.localStorage['accessToken'];
        //var token= Auth.getAuth().facebook.accessToken;
        console.log(token);

        FB.api('/me', 'get', { 'access_token': token }, function(response) {
            console.log(response);
            FB.api("/" + response.id + "/permissions", { 'access_token': token }, function(response) {
                if (response) {
                    console.log(response);
                }
            });
        });
        /*
            FB.api('/me/feed', 'post', { message: 'hello world from jarvis','access_token':token }, function(response) {
              console.log(response);
              if (!response || response.error) {
                alert('Error occured');
              } else {
                alert('Post ID: ' + response.id);
              }
            });
        */

    }
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.$parent.setHeaderFab('left');

    // Delay expansion
    $timeout(function() {
        $scope.isExpanded = true;
        $scope.$parent.setExpanded(true);
    }, 300);

    artyom.say("good evening sir this is jarvis reporting");


    // Set Motion
    //ionicMaterialMotion.ripple();

    // Set Ink
    //ionicMaterialInk.displayEffect();
})

.controller('ProfileCtrl', function($scope, $stateParams, $timeout, ionicMaterialMotion, ionicMaterialInk) {
    // Set Header
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.isExpanded = false;
    $scope.$parent.setExpanded(false);
    $scope.$parent.setHeaderFab(false);

    // Set Motion
    $timeout(function() {
        ionicMaterialMotion.slideUp({
            selector: '.slide-up'
        });
    }, 300);

    $timeout(function() {
        ionicMaterialMotion.fadeSlideInRight({
            startVelocity: 3000
        });
    }, 700);

    // Set Ink
    ionicMaterialInk.displayEffect();
})

.controller('ActivityCtrl', function($scope, $stateParams, $timeout, ionicMaterialMotion, ionicMaterialInk) {
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.isExpanded = true;
    $scope.$parent.setExpanded(true);
    $scope.$parent.setHeaderFab('right');

    $timeout(function() {
        ionicMaterialMotion.fadeSlideIn({
            selector: '.animate-fade-slide-in .item'
        });
    }, 200);

    // Activate ink for controller
    ionicMaterialInk.displayEffect();



})

.controller('GalleryCtrl', function($scope, $stateParams, $timeout, ionicMaterialInk, ionicMaterialMotion) {
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.isExpanded = true;
    $scope.$parent.setExpanded(true);
    $scope.$parent.setHeaderFab(false);

    $timeout(function() {
        ionicMaterialMotion.fadeSlideIn({
            selector: '.animate-fade-slide-in .item'
        });
    }, 200);

    // Activate ink for controller
    ionicMaterialInk.displayEffect();

    ionicMaterialMotion.pushDown({
        selector: '.push-down'
    });
    ionicMaterialMotion.fadeSlideInRight({
        selector: '.animate-fade-slide-in .item'
    });
    $scope.imgsrc = "img/jarvis_voice.png";
    $scope.listening = 0;
    $scope.changepic = function() {
        if ($scope.listening) {
            $scope.imgsrc = "img/jarvis_voice.png";
            $scope.listening = 0;
            console.log($scope.imgsrc);
        } else {
            $scope.imgsrc = "img/jarvis_voice.gif";
            $scope.listening = 1;
            console.log($scope.imgsrc);
        }
    }

});
