var app = angular.module("untitledProject",[]);
app.controller('driverHomeController', function($scope, $filter, loadStatusSvc, basicService){

    const drID = JSON.parse(sessionStorage.getItem('registeredUser')).uid;

    var getPosition = {
        success: function(res){
            console.log(res);
            $scope.buttonText = "Update Location";
            $scope.buttonClass = "location-update-button";
        },
        failure: function(){
            console.log("FAILURE");
        },
        notPresent: function(){
            console.log("Not Present");
        },
        sendDataToServer: function(position){
            var present = new Date();
            var updateObj = {
                driver: drID,
                load: $scope.load.loadNumber || null,
                date: $filter('date')(present, 'yyyy-MM-dd'),
                time: $filter('date')(present, 'HH:mm:ss'),
                lat: position.coords.latitude,
                lon: position.coords.longitude
            };
            basicService.put('../node/location-updates', updateObj)
            .then(function success(response){
                    getPosition.success(response);
                }, function failure(response){
                    getPosition.connectionError(response)
                });
        },
        connectionError: function(res){
            console.log(res);
        }
    };

    function refresh(){
        var len = $scope.load.stops.length;
        var counter = 0;
        for (var i = 0; i < len; i++){
            if ($scope.load.stops[i].status == 5){
                counter += 1;
            } else {
                break;
            }
        }
        if (counter && counter == len){
            console.log("DELIVER");
            deliverLoad();
        }
    };

    function selectOpen(arr){
        var length = arr.length;
        var counter = 0;
        for (var n = 0; n < length; n++){
            if (arr[n].status == 1 && !!arr[(n-1)]){
                arr[(n-1)].open = true;
                if (arr[(n-2)]){
                    arr[(n-2)].open = false;
                }
                break;
            } else {
                counter += 1;
            }
        }
        if (counter == length){
            arr[(length - 1)].open = true;
            arr[(length - 2)].open = false;
        } else if (counter == 0) {
            arr[0].open = true;
        }
    };

    function selectLoad(rows){
        selectDriver(rows[0]);
        return rows[0];
    };

    function selectDriver(load){
        if (load && load.driver) {
            $scope.driver = {
                ID: load.driver,
                firstName: load.firstName,
                lastName: load.lastName
            };
        }
    };

    function deliverLoad(){
        basicService.put('../node/deliveries', {load: $scope.load.loadNumber})
        .then(function success(response){
            $scope.getDriverData();
        }, function failure(response){
            console.log(response);
        });
    };

    $scope.driver = {};
    $scope.load = {};

    $scope.buttonText = "Update Location";
    $scope.buttonClass = "location-update-button";

    $scope.getDriverData = function(){
        basicService.get('../node/driver-home-data/?driver=' + drID)
        .then(function success(response){
            var len = response.length;
            for (var i = 0; i < len; i++){
                response[i].stops = JSON.parse(response[i].stops);
                selectOpen(response[i].stops);
            }
            $scope.load = selectLoad(response);
            refresh();
        }, function failure(response){
            console.log({error: true, response: response});
        });
    };

    $scope.locationProvide = function(){
        if (navigator.geolocation){
            $scope.buttonText = "Updating";
            $scope.buttonClass += " button-loading";
            navigator.geolocation.getCurrentPosition(getPosition.sendDataToServer, getPosition.failure);
        } else {
            getPosition.notPresent();
        }
    };

    $scope.getDriverData();

});
app.directive('utpDriverHome', function(){

    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'driverHome_tmp.html'
    }

});
app.controller('driverHomeStopController', function($scope, basicService){

    $scope.buttonText = '';

    $scope.collapsed = {
        button: function(){
            return !$scope.info.open ? '+' : '--';
        },
        toggle: function(){
            $scope.info.open = !$scope.info.open;
        }
    };

    $scope.phoneFormat = function(number){
        var num = String(number);
        var str = "(";
        str += num.slice(0,3);
        str += ") ";
        str += num.slice(3,6);
        str += " - ";
        str += num.slice(6,10);
        return str;
    };

    $scope.progress = function(){
        var stat = parseInt($scope.info.status);
        if (stat == 1){
            checkIn();
            $scope.refresh();
        } else if (stat == 4){
            finish();
        } else {
            setStopStatus(stat + 1);
        }
    }

    function checkIn(){
        basicService.put('../../node/check-in', {load: $scope.load})
        .then(function success(response){
            $scope.info.status = 2;
            setButtonText();
        }, function failure(response){
            console.log(response);
        });
    };

    function setStopStatus(int){
        basicService.put('../../node/stop-status', { stop: $scope.info.stopID, status: int })
        .then(function success(response){
            $scope.info.status = int;
            setButtonText();
        }, function failure(response){
            console.log(response);
        });
    };

    function finish(){
        basicService.put('../node/finish-stop', { stop: $scope.info.stopID, load: $scope.load })
        .then(function success(response){
            $scope.info.status = 4;
            $scope.collapsed.state = true;
            $scope.refresh(true);
        }, function failure(response){
            console.log(response);
        });
    };

    function setButtonText (){
        var stat = $scope.info.status;
        if (stat == 1){
            $scope.buttonText = "En Route";
        } else if (stat == 2){
            $scope.buttonText = "Arrived";
        } else if (stat == 3){
            $scope.buttonText = "Truck Being Worked";
        } else if (stat == 4){
            $scope.buttonText = "Finished";
        } else if (stat == 5){
            $scope.buttonText = "Rejected";
        }
    };

    setButtonText();

});
app.directive('utpDriverHomeStop', function(){

    return {
        restrict: 'E',
        scope: {
            info:'=',
            load:'@',
            refresh:'='
        },
        templateUrl: 'driverHomeStop_tmp.html'
    }

});
app.directive('utpAlert', function(){

    return {
        restrict: 'E',
        scope: {
            alert: '='
        },
        templateUrl: 'alert_tmp.html'
    }

});
app.service('basicService', function($http, $q){

    function post(endpoint, data, success, failure){
        var prom = $q.defer();
        $http.post(endpoint, data)
        .success(function(response){
            if (!response.error){
                if (success && typeof success == 'function'){
                    success(prom, response);
                } else {
                    if (response[0] && response[0].serverStatus){
        				response.shift();
                        prom.resolve(response[0]);
        			} else {
                        prom.resolve(response);
                    }
                }
            } else {
                if (failure && typeof failure == 'function'){
                    failure(prom, response);
                } else {
                    prom.reject(response);
                }
            }
        })
        .error(function(response){
            if (failure && typeof failure == 'function'){
                failure(prom, response);
            } else {
                prom.reject(response);
            }
        });
        return prom.promise;
    };

    function get(endpoint, success, failure){
        var prom = $q.defer();
        $http.get(endpoint)
        .success(function(response){
            if (!response.error){
                if (success && typeof success == 'function'){
                    success(prom, response);
                } else {
                    if (response[0] && response[0].serverStatus){
        				response.shift();
                        prom.resolve(response[0]);
        			} else {
                        prom.resolve(response);
                    }
                }
            } else {
                if (failure && typeof failure == 'function'){
                    failure(prom, response);
                } else {
                    prom.reject(response);
                }
            }
        })
        .error(function (response){
            if (failure && typeof failure == 'function'){
                failure(prom, response);
            } else {
                prom.reject(response);
            }
        });
        return prom.promise;
    };

    function put(endpoint, data){
        var prom = $q.defer();
        $http.put(endpoint, data)
        .success(function(response){
            if (!response.error){
                var ret = {success: true};
                angular.forEach(response, function(v, k){
                    if (!v.affectedRows && v.affectedRows != 0 && v[0] && v[0].insertID){
                        ret.insertID = v[0].insertID;
                    }
                });
                prom.resolve(ret);
            } else {
                prom.reject(response);
            }
        })
        .error(function(response){
            prom.reject(response);
            console.log('error',response);
        });
        return prom.promise;
    };

    function del(endpoint, success, failure){
        var prom = $q.defer();
        $http.delete(endpoint)
        .success(function(response){
            if (!response.error){
                if (success && typeof success == 'function'){
                    success(prom, response);
                } else {
                    if (response[0] && response[0].serverStatus){
        				response.shift();
                        prom.resolve(response[0]);
        			} else {
                        prom.resolve(response);
                    }
                }
            } else {
                if (failure && typeof failure == 'function'){
                    failure(prom, response);
                } else {
                    prom.reject(response);
                }
            }
        })
        .error(function (response){
            if (failure && typeof failure == 'function'){
                failure(prom, response);
            } else {
                prom.reject(response);
            }
        });
        return prom.promise;
    };

    return {
        post,
        get,
        put,
        del
    }

});
app.factory('constants', function(){

    return {
        viewport: {
            mobile: 504,
            desktop: 960
        }
    };

});
app.service("cookiesService", function(){

  return {

    tools: {

      set : function(name, value, options){

        var data = [encodeURIComponent(name) + '=' + encodeURIComponent(value)];

        if (options){

          if ('expiry' in options){
            if (typeof options.expiry == 'number'){
              options.expiry = new Date(options.expiry * 1000 + +new Date);
            }
            data.push('expires=' + options.expiry.toGMTString());
          }

          if ('domain' in options) data.push('domain=' + options.domain);
          if ('path'   in options) data.push('path='   + options.path);
          if ('secure' in options && options.secure) data.push('secure');

        }

        document.cookie = data.join('; ');

      },

      get : function(name, keepDuplicates){

        var values = [];

        var cookies = document.cookie.split(/; */);
        for (var i = 0; i < cookies.length; i ++){

          var details = cookies[i].split('=');
          if (details[0] == encodeURIComponent(name)){
            values.push(decodeURIComponent(details[1].replace(/\+/g, '%20')));
          }

        }

        return (keepDuplicates ? values : values[0]);

      },

      clear : function(name, options){

        if (!options) options = {};
        options.expiry = -86400;
        this.set(name, '', options);

      }

    }


  }

});

app.service('freightFilters', function(){

    function handling(int){
		if (int == 1){
			return "Pallets";
		} else if (int == 2){
			return "Gaylords";
		} else if (int == 3){
			return "Boxes (50 or less)";
		} else if (int == 4){
			return "Boxes (More than 50)";
		} else if (int == 5){
			return "Floor-Loaded/Loose";
		} else {
			return "ERROR";
		}
	}

    function stopAction(int, capitalize){
        var str = ''
        if (int == 0){
            str = "pickup";
        } else {
            str = "delivery";
        }
        if (capitalize){
            return str.charAt(0).toUpperCase() + str.slice(1);
        } else {
            return str;
        }
    }

    function loadStatus(int){
        var obj = {};
        if (int == 0){
            obj = {
                'state': 'On Hold',
                'action': 'put on hold'
            }
        } else if (int == 1){
            obj = {
                'state': 'Ready',
                'action': 'readied'
            }
        } else if (int == 2){
            obj = {
                'state': 'In Progress',
                'action': 'begun'
            }
        }

        return obj;
    }

    function stopStatus(int){
        var str = '';
        if (int == 1){
            str = "Not Yet Started";
        } else if (int == 2){
            str = 'En Route';
        } else if (int == 3){
            str = 'At Stop';
        } else if (int == 4){
            str = 'Working';
        } else if (int == 5){
            str = 'Finished';
        } else if (int == 6){
            str = 'Rejected';
        }
        return str;
    }

    return {
        handling,
        stopAction,
        loadStatus,
        stopStatus
    }

});
app.service('googleAPI', function ($http, $q){

    var geocodeURI = "https://maps.googleapis.com/maps/api/geocode/json";
    var distanceURI = "http://maps.googleapis.com/maps/api/distancematrix/json";//?origins=60657&destinations=60614&mode=driving&sensor=false

    function reverseGeocode(lat, lon){
        var prom = $q.defer();
        var url = geocodeURI + '?latlng=' + lat + ',' + lon + '&sensor=true';
        $http.get(url)
        .success(function(response){
            prom.resolve(response);
        })
        .error(function(response){
            prom.reject(response);
        });
        return prom.promise;
    };

    function addressCheck (address1, city, state) {
        var prom = $q.defer();
        ad = address1.replace(" ", "+") + ',';
        city += ',';
        var url = geocodeURI + "?address=" + ad + city + state;
        $http.get(url)
        .success(function(response){
            var obj = response || {};
            var res = obj.results ? obj.results[0] || {} : {};
            if (!obj.results || obj.results.length == 0){
                prom.reject({error: 'no results'});
            } else if (obj.results && obj.results.length > 1){
                prom.reject({error: 'multiple results'});
            } else if (!obj.results){
                prom.reject({error: 'no results'});
            } else {
                var respObj = {};
                var len = res.address_components.length;
                var arr = res.address_components;
                var attrs = ['street_number', 'route', 'locality', 'administrative_area_level_1', 'postal_code'];
                var attrLen = attrs.length;
                function idxTo(arg, idx){
                    if (arr[idx].types.indexOf(arg) >= 0){
                        respObj[arg] = arr[idx].short_name;
                    };
                }
                for (var i = 0; i < len; i++){
                    for (var x = 0; x < attrLen; x++){
                        var atr = attrs[x];
                        idxTo(atr, i);
                    }
                }
                respObj.exactMatch = !res.partial_match;
                prom.resolve(respObj);
            }
        })
        .error(function(response){
            console.log(response);
            prom.reject({error: 'connection'});
        });
        return prom.promise;
    }

    return {
        reverseGeocode,
        addressCheck
    };

});
app.service('loadStatusSvc', function($http, $q){

    var stop = {
        set: function(stopID, status){
            var prom = $q.defer();
            var data = {
                stop: stopID,
                status: status
            };
            var url = "../node/setStopStatus";
            $http.post(url, data)
            .success(function(response){
                prom.resolve(response);
            })
            .error(function(response){
                prom.reject(response);
            });
            return prom.promise;
        },
        finish: function(stopID, loadNumber){
            var prom = $q.defer();
            var data = {
                stop: stopID,
                load: loadNumber
            };
            var url = "../node/finishStop";
            $http.post(url, data)
            .success(function(response){
                prom.resolve(response);
            })
            .error(function(response){
                prom.reject(response);
            });
            return prom.promise;
        }
    }

    var load = {
        bounce: function(loadNumber){
            console.log("Bounce " + loadNumber);
        },
        checkIn: function(loadNumber){
            var prom = $q.defer();
            var data = {
                load: loadNumber
            };
            var url = "../node/checkInToLoad";
            $http.post(url, data)
            .success(function(response){
                prom.resolve(response);
            })
            .error(function(response){
                prom.reject(response);
            });
            return prom.promise;
        },
        deliver: function(loadNumber){
            var prom = $q.defer();
            var data = {
                load: loadNumber
            };
            var url = "../node/deliverLoad";
            $http.post(url, data)
            .success(function(response){
                prom.resolve(response);
            })
            .error(function(response){
                prom.reject(response);
            });
            return prom.promise;
        }
    }

    return {
        stop,
        load
    }

});
app.controller('modalController', function($scope){

    var ctrl = this;

    ctrl.height = $scope.modalHeight || 'auto';

    ctrl.width = $scope.modalWidth || 'auto';

    ctrl.close = function(){
        $scope.showModal = false;
    };

});
app.directive("utpModal", function(){

	return {
		restrict: "E",
        transclude: true,
		scope: {
            modalWidth:'@',
            modalHeight:'@',
            showModal:'='
        },
		templateUrl: "modal_tmp.html",
        controller: 'modalController',
		controllerAs: 'modal'
	}

});
app.controller('navbarController', function($scope, $window){

	var ctrl = this;

	$scope.navbarObj = {};

	$scope.navbarFill = function(){
		var userType = sessionStorage.getItem('registeredUser') ? JSON.parse(sessionStorage.getItem('registeredUser')).type : '0';
		$scope.navbarObj = (userType == '0') ? ctrl.homepageNavbar : (userType == '1') ? ctrl.customerNavbar : (userType == '2') ? ctrl.carrierNavbar : (userType == '3') ? ctrl.driverNavbar : ctrl.homepageNavbar;
	};

	$scope.securityCheck = function(){
		var uid = JSON.parse(sessionStorage.getItem('registeredUser') || '{}').uid || null;
		if (!uid && $window.location.pathname != "/"){
			$window.location.assign("/");
		}
	};

	ctrl.customerNavbar = [
		{
			name: 'Logout',
			clickJs: function(){
				ctrl.logout();
			}
		},
		{
			name: 'Build Load',
			destination: '/customer/buildload'
		},
		{
			name: 'Dashboard',
			destination: '/customer'
		}
	];

	ctrl.carrierNavbar = [
		{
			name: 'Logout',
			clickJs: function(){
				ctrl.logout();
			}
		},
		{
			name: 'Available Loads',
			destination: '/carrier/bid'
		},
		{
			name: 'Dashboard',
			destination: '/carrier'
		}
	];

	ctrl.driverNavbar = [
		{
			name: 'Logout',
			clickJs: function(){
				ctrl.logout();
			}
		}
	]

	ctrl.homepageNavbar = [
		{
			name: 'Home',
			destination: '/'
		}
	];

	ctrl.logout = function(){
		sessionStorage.setItem('registeredUser','{}');
		$window.location.href = "/";
	};

});
app.directive('utpNavbar', function(){

	return {
		restrict: 'E',
		scope: {},
		templateUrl: 'navbar_tmp.html'
	}

});
app.service('timeDateSvc', function($filter){

    function differenceInDays(firstDate, secondDate) {
        var dt1 = firstDate.split('-'),
            dt2 = secondDate.split('-'),
            one = new Date(dt1[0], dt1[1]-1, dt1[2]),
            two = new Date(dt2[0], dt2[1]-1, dt2[2]);

        var millisecondsPerDay = 1000 * 60 * 60 * 24;
        var millisBetween = two.getTime() - one.getTime();
        var days = millisBetween / millisecondsPerDay;

        return Math.floor(days);
    }

    function differenceInMinutes(firstTime, secondTime) {
        var t1 = firstTime.split(':');
        var t2 = secondTime.split(':');
        var time1 = (60 * parseInt(t1[0])) + parseInt(t1[1]);
        var time2 = (60 * parseInt(t2[0])) + parseInt(t2[1]);
        return (time2 - time1);
    }

    function parseTime(time){
        return parseInt(time.slice(0,2)) > 12 ? (parseInt(time.slice(0,2)) - 12) + ":" + time.slice(3,5) + " PM" : parseInt(time.slice(0,2)) == 12 ? time.slice(0,-3) + " PM" : time.slice(0,-3) + " AM";
    }

    function relativeDate(date){
        var today = $filter('date')(new Date(),'yyyy-MM-dd');
        var diff = this.differenceInDays(today, date);
        if (diff == 0){
            return "today";
        } else if (diff == -1){
            return "yesterday";
        } else if (diff == 1){
            return "tommorrow";
        } else {
            var arr = date.split('-');
            return " on " + arr[1] + '/' + arr[2] + '/' + arr[0];
        }
    }

    return {
        differenceInDays,
        differenceInMinutes,
        parseTime,
        relativeDate
    }

});
app.service("userDataService",function($http, $q){

	return {

		verifyCredentials: function(username,password){

			var prom = $q.defer();

			var data = {"un": username, "pw": password};

			$http.post("node/validateCredentials", data)
			.success(function(response){
				prom.resolve(response);
			})
			.error(function(error){
				prom.reject(error);
			});

			return prom.promise;

		}

	}

});

app.factory('viewport', function($window, constants){

    function isMobile(){
        return ($window.innerWidth <= constants.viewport.mobile);
    }

    function isTablet(){
        return ($window.innerWidth > constants.viewport.mobile && $window.innerWidth < constants.viewport.desktop);
    }

    function isDesktop(){
        return ($window.innerWidth >= constants.viewport.desktop);
    }

    return {
        isMobile,
        isTablet,
        isDesktop
    };

});
