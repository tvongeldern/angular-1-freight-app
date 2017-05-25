var app = angular.module("untitledProject",[]);
app.controller('bidModalController', function($scope, $filter, timeDateSvc, basicService, freightFilters){

	var ctrl = this;

	$scope.load = {};

	$scope.submitError = null;

	$scope.varCache = {
		weight: null,
		handling: null
	};

	$scope.editable = {
		weight: false,
		handling: false
	};

	$scope.bid = {
		loadNumber: undefined,
		weight: undefined,
		handling: undefined,
		money: undefined,
		driver: null,
		stops: {}
	};

	ctrl.pullData = function (loadObject){
		$scope.bid.loadNumber = loadObject.loadNumber;
		$scope.bid.carrier = JSON.parse(sessionStorage.getItem('registeredUser')).uid || 'testcar';
	};

	ctrl.handlingFilter = freightFilters.handling

	ctrl.toggleWeight = function(weight){
		$scope.editable.weight = !$scope.editable.weight;
		if ($scope.bid.weight == null){
			$scope.varCache.weight = weight;
		} else {
			weight = $scope.varCache.weight;
			$scope.bid.weight = null;
		}
	};

	ctrl.toggleHandling = function(handling){
		$scope.editable.handling = !$scope.editable.handling;
		if ($scope.bid.handling == null){
			$scope.varCache.handling = handling;
		} else {
			handling = $scope.varCache.handling;
			$scope.bid.handling = null;
		}
	};

	ctrl.submitBid = function(loadObject, callback){

		ctrl.pullData(loadObject);

		var arr = [];
		var asIs = true;

		for (var i = 0; i < loadObject.stops.length; i++){
			if (loadObject.stops[i].adjustments){

				if (loadObject.stops[i].adjustments.time){
					loadObject.stops[i].adjustments.newTime = $filter('date')(loadObject.stops[i].adjustments.time, 'HH:mm');
					loadObject.stops[i].adjustments.stopID = loadObject.stops[i].stopID;
					asIs = false;
				};

				if (loadObject.stops[i].adjustments.date){
					loadObject.stops[i].adjustments.newDate = $filter('date')(loadObject.stops[i].adjustments.date, 'yyyy-MM-dd');
					loadObject.stops[i].adjustments.stopID = loadObject.stops[i].stopID;
					asIs = false;
				};

				arr.push(loadObject.stops[i].adjustments);
			}
		};

		if (!asIs){
			$scope.bid.stops = arr;
		} else {
			$scope.bid.stops = [];
		}

		$scope.bid.driver = JSON.parse($scope.bid.driver) ? JSON.parse($scope.bid.driver).driverID : null;
		$scope.bid.bidAgent = JSON.parse(sessionStorage.getItem('registeredUser')).uid;

		if (!$scope.bid.money){
			$scope.submitError = "Bid cannot be submitted without an amount";
		} else {
			basicService.put('../../node/new-bid', {bid: $scope.bid})
				.then(function success(){
					callback();
				}, function failure(response){
					console.log(response);
					console.log("FAIL");
				});
		}

	};

	ctrl.cannotTake = function(driver, load){
		/*/var truck = {
			time: (driver.drStatus == 1) ? driver.nextEmptyTime : null,
			date: (driver.drStatus == 1) ? $filter('date')(driver.nextEmptyDate,'yyyy-MM-dd') : null,
			zip: (driver.drStatus == 1) ? driver.nextEmptyZip : null
		};
		var ship = {
			time: load.stops[0].lateTime,
			date: $filter('date')(load.stops[0].lateDate,'yyyy-MM-dd'),
			zip: load.stops[0].zip
		};/*/
		var val = false;

		/*/if ((truck.date == null) || (truck.time == null)){
			val = false;
		} else if (timeDateSvc.differenceInDays(truck.date, ship.date) < 0){
			val = true;
		} else if ((timeDateSvc.differenceInDays(truck.date, ship.date) == 0) && (timeDateSvc.differenceInMinutes(truck.time,ship.time) > (50 * getD(truck.zip, ship.zip)))){
			val = true;
		}/*/

		return val;
	};

});
app.directive('utpBidModal', function(){

	return {
		restrict: 'E',
		scope: {
			info: '=',
			drivers: '=',
			hide: '='
		},
		controller: 'bidModalController',
		controllerAs: 'bidModalCtrl',
		templateUrl: 'bidModal_tmp.html'
	}

});
app.controller('bidModalStopController', function($scope){

	$scope.newStopDate = false;

	$scope.newStopTime = false;

	$scope.toggleDate = function (){
		$scope.newStopDate = !$scope.newStopDate;
	};

	$scope.toggleTime = function (){
		$scope.newStopTime = !$scope.newStopTime;
	};

});
app.directive('utpBidModalStop',function(){

	return {
		restrict: 'E',
		scope: {
			info: '='
		},
		templateUrl: 'bidModalStop_tmp.html'
	}

});
app.controller('carrierDashBidController', function($scope, $window, $filter, freightFilters, basicService){

    var ctrl = this;

    $scope.popup = {
        show: false,
        counter: false,
        vertical: -100,
        data: {},
        submitCounter: function(){
            var bidObj = {
                    loadNumber: $scope.info.loadNumber,
                    money: $scope.popup.data.amount,
                    weight: $scope.popup.data.weight || $scope.info.weight,
                    handling: $scope.info.weight,
                    carrier: JSON.parse(sessionStorage.getItem('registeredUser')).uid,
                    driver: $scope.info.driver,
                    counterTo: $scope.info.bidNumber,
                    bidAgent: JSON.parse(sessionStorage.getItem('registeredUser')).uid,
                    stops: []
            };
            angular.forEach($scope.popup.data, function(value, key){
                if (key != 'amount'){
                    var stopObj = {
                        stopID: key
                    };
                    if (value.date){
                        stopObj.date = true;
                        stopObj.newDate = $filter('date')(value.date, 'yyyy-MM-dd');
                    }
                    if (value.time){
                        stopObj.time = true;
                        stopObj.newTime = $filter('date')(value.time, 'HH:mm');
                    }
                    bidObj.stops.push(stopObj);
                }
            });
            basicService.put('../../node/new-bid', bidObj)
            .then(function success(response){
                console.log(response);
            }, function failure(response){
                console.log(response);
            });
        }
    };

    ctrl.bidder = function(bid){
        if ((JSON.parse(sessionStorage.getItem('registeredUser')).uid == $scope.info.bidAgent) && ($scope.info.counterTo)){
            return {
                code: 1,
                desc: "Carrier Counteroffer"
            };
        } else if (!$scope.info.counterTo) {
            return {
                code: 2,
                desc: "Carrier Offer"
            };
        } else {
            return {
                code: 3,
                desc: "Customer Counteroffer"
            };
        }
    };

    ctrl.parseInfo = function(){
        if (!$scope.info.locations[0].city && !$scope.info.locations[0].state){
            $scope.drivers = JSON.parse($scope.drivers);
            $scope.info.locations = JSON.parse($scope.info.locations);
            $scope.info.original = JSON.parse($scope.info.original);
            if ($scope.info.adjustments){
                $scope.info.adjustments = JSON.parse($scope.info.adjustments);
            }
        }
    };

    ctrl.route = (function(){
        var str = $scope.info.loadNumber + " ";
        var arr = typeof $scope.info.locations == 'string' ? JSON.parse($scope.info.locations) : $scope.info.locations;
        var len = arr.length;
        for (var i = 0; i < len; i++){
            str += arr[i].city + ", " + arr[i].state + " - ";
        }
        return str.slice(0,-3);
    })();

    ctrl.changes = (function(){
        var adjustments, str = '';
        if ($scope.info.stopsAsIs && !$scope.info.weight && !$scope.info.handling){
            str += "As is";
        } else {
            if ($scope.info.weight || $scope.info.handling){
                str += "Bid ";
                if ($scope.info.weight){
                    str += "weight: " + $scope.info.weight;
                }
                if ($scope.info.weight && $scope.info.handling){
                    str += " and ";
                }
                if ($scope.info.handling){
                    str += "handling: " + freightFilters.handling($scope.info.handling);
                }
                str += $scope.info.stopsAsIs ? " " : ", ";
            }
            if (!$scope.info.stopsAsIs){
                adjustments = typeof $scope.info.adjustments == 'string' ? JSON.parse($scope.info.adjustments) : $scope.info.adjustments;
                angular.forEach(adjustments, function(value, key){
                    var city, state, action;
                    if (value.newDate || value.newTime){
                        var locations = typeof $scope.info.locations == 'string' ? JSON.parse($scope.info.locations) : $scope.info.locations;
                        var len = locations.length;
                        for (var i = 0; i < len; i++){
                            if (locations[i].stopID == key){
                                city = locations[i].city;
                                state = locations[i].state;
                                action = freightFilters.stopAction(locations[i].action, true);
                            }
                        }
                    }
                    str += action + " in " + city + ", " + state + " @ " + value.newTime//.slice(0, -3);
                    str += value.newTime ? "  " + value.newDate : value.newDate;
                    str += " ";
                });
            }
        }
        return str;
    })();

    ctrl.removeBid = function(){
        basicService.del('../../node/delete-bid/?bid=' + $scope.info.bidNumber)
        .then(function success(){
            $scope.refresh();
        }, function failure(){
            console.log("ERROR");
        });
    };

    ctrl.approveBid = function(){
        basicService.post('../../node/approve-bid', $scope.info)
        .then(function success(){
            $scope.refresh();
        }, function failure(response){
            if (response.error && (response.error == "nodr")){
                console.log("NEED DRIVER");
            } else {
                console.log("ERROR");
            }
        });
    };

    ctrl.showDetails = function(event){
        var fromBottom = $window.innerHeight - event.clientY;
        if (fromBottom < 300 && event.clientY > 300) {
            $scope.popup.vertical = -300;
        } else {
            $scope.popup.vertical = -100;
        }
        $scope.popup.show = !$scope.popup.show;
    };

    ctrl.hideDetails = function(){
        $scope.popup.show = false;
        $scope.popup.counter = false;
    };

    $scope.filters = {
        stopHeader: function(action){
            return freightFilters.stopAction(action).charAt(0).toUpperCase() + freightFilters.stopAction(action).slice(1);
        },
        location: function(stop){
            return stop.city + ', ' + stop.state + ' ' + stop.zip;
        },
        handling: function(int){
            return freightFilters.handling(int);
        }
    };

    ctrl.driverCanGet = function(driver){
        return true;
    };

    ctrl.openCounterMenu = function(){
        $scope.popup.show = true;
        $scope.popup.counter = true;
    };

});
app.directive('utpCarrierDashBid', function(){

    return {
        restrict: 'E',
        scope: {
            info: '=',
            drivers: '@',
            refresh: '='
        },
        controller: 'carrierDashBidController',
        controllerAs: 'cdbCtrl',
        templateUrl: 'carrierDashBid_tmp.html'
    }

});
app.controller('carrierDashboardController', function($scope, basicService){

    var ctrl = this;
    var user = JSON.parse(sessionStorage.getItem('registeredUser') || '{}').uid;

    $scope.searchVar = '';

    $scope.bids = [];
    $scope.drivers = [];
    $scope.loads = [];
    $scope.delivered = [];

	ctrl.showTab = function(input){
		$scope.tabVar = input;
        retrieve(input);
        if (input == 'bids'){
            retrieve('drivers')
        }
	};

    function retrieve(input){
        basicService.get('../../node/carrier-dashboard-' + input + '/?user=' + user)
        .then(function success(response){
            $scope[input] = response;
        }, function failure(response){
            console.log(response);
        });
    };

});
app.directive('utpCarrierDashboard', function(){

    return {
        restrict: 'E',
        scope: {},
        controller: 'carrierDashboardController',
        controllerAs: 'crCtrl',
        templateUrl: 'carrierDashboard_tmp.html'
    }

});
app.controller('carrierDashDriverController', function($scope, timeDateSvc, googleAPI){

    var ctrl = this;

    function initialize(){
        if (typeof $scope.info.tenderedLoad == 'string'){
            $scope.info.tenderedLoad = JSON.parse($scope.info.tenderedLoad);
        }
        if (typeof $scope.info.transitLoad == 'string'){
            $scope.info.transitLoad = JSON.parse($scope.info.transitLoad);
        }
        if (typeof $scope.info.upData == 'string'){
            $scope.info.upData = JSON.parse($scope.info.upData);
        }
        displayUpdate();
    };

    function displayUpdate(){
        var update = $scope.info.upData;
        if (!update){
            $scope.latestUpdate =  "Not Available";
        } else if ($scope.info.transitLoad) {
            var load = $scope.info.transitLoad || {};
            var stop = load.stops[0];
            if ($scope.info.transitLoad){
                var len = $scope.info.transitLoad ? $scope.info.transitLoad.stops.length : 0;
                for (var i = 0; i < len; i++){
                    if ($scope.info.transitLoad.stops[i].status == 1){
                        stop = $scope.info.transitLoad.stops[i];
                    }
                }
            }
            var distance = getDistance(update.lat, update.lon, zipIndex[stop.zip].latitude, zipIndex[stop.zip].longitude).toFixed(1);
            $scope.latestUpdate = distance + " miles from " + stop.city + ", " + stop.state + " at " + timeDateSvc.parseTime(update.time) + " " + timeDateSvc.relativeDate(update.date);
        } else {
            googleAPI.reverseGeocode(update.lat, update.lon)
            .then(function success(response){
                var city,state,
                    obj = response.results[0].address_components,
                    len = obj.length;
                for (var i = 0; i < len; i++){
                    if (city && state){
                        break;
                    } else if (obj[i].types.indexOf('political') >= 0 && obj[i].types.indexOf('locality') >= 0) {
                        city = obj[i].short_name;
                    } else if (obj[i].types.indexOf('political') >= 0 && obj[i].types.indexOf("administrative_area_level_1") >= 0) {
                        state = obj[i].short_name;
                    }
                }
                ret = city + ", " + state + " at " + timeDateSvc.parseTime(update.time) + " " + timeDateSvc.relativeDate(update.date);
                $scope.latestUpdate = ret;
            }, function failure(response){
                console.error(response);
                $scope.latestUpdate = "ERROR with googleAPI";
            });
        }
    };

    $scope.returnHeader = function(load){
        var str = load.loadNumber + " - ";
        var len = load.stops.length;
        for (var i = 0; i < len; i++){
            str += load.stops[i].city + ", " + load.stops[i].state + " - ";
        }
        return str.slice(0, -3) + " (" + returnStatus(load) + ")";
    };

    function returnStatus (load){
        if (load.status == 1){
            return "Not Yet Started";
        } else if (load.stops[0].status == 1){
            return "Checked In";
        } else if (load.stops[0].status == 2){
            return "At Shipper";
        } else if (load.stops[0].status == 3){
            return "Loading";
        } else if (load.stops[(load.stops.length - 1)].status < 2){
            return "In Progress";
        } else if (load.stops[(load.stops.length - 1)].status == 2){
            return "At Receiver";
        } else if (load.stops[(load.stops.length - 1)].status == 3){
            return "Unloading";
        } else {
            return "Error";
        }
    };

    initialize();

});
app.directive('utpCarrierDashDriver', function(){

    return {
        restrict: 'E',
        scope: {
            info: '='
        },
        templateUrl: 'carrierDashDriver_tmp.html',
        controller: 'carrierDashDriverController'
    }

});
/*/app.service('carrierDashDriverSvc', function($http, $q){



});/*/
app.controller('carrierDashLoadController', function($scope){

    var ctrl = this;

    $scope.initialize = function(){
        if (typeof $scope.info.stops == 'string'){
            $scope.info.stops = JSON.parse($scope.info.stops);
        }
    };

    $scope.loadHeader = function(){
        return "Load Number " + $scope.info.loadNumber;
    };

});
app.directive('utpCarrierDashLoad', function(){

    return {
        restrict: 'E',
        scope: {
            info: '='
        },
        templateUrl: 'carrierDashLoad_tmp.html'
    }

});
app.controller('carrierCounteroffersController', function($scope, basicService, freightFilters){

    var ctrl = this;

    $scope.offers = [];

    ctrl.fetchOffers = function(){
        basicService.get('../../node/carrier-counteroffers/?uid=' + JSON.parse(sessionStorage.getItem('registeredUser') || '{}').uid)
        .then(function success(response){
            $scope.offers = response;
            for (var i = 0; i < response.length; i++){
                if ($scope.offers[i].adjustments){
                    $scope.offers[i].adjustments = JSON.parse($scope.offers[i].adjustments);
                }
                if ($scope.offers[i].locations){
                    $scope.offers[i].locations = JSON.parse($scope.offers[i].locations);
                }
            }
        }, function failure(response){
            console.log(response);
        });
    };

    ctrl.closeOffer = function(bidNumber){
        if (!localStorage.getItem('carrierHiddenCounters')){
            var arr = [];
            arr.push(bidNumber);
            localStorage.setItem('carrierHiddenCounters', JSON.stringify(arr));
        } else {
            var hidden = JSON.parse(localStorage.getItem('carrierHiddenCounters'));
            hidden.push(bidNumber);
            localStorage.setItem('carrierHiddenCounters', JSON.stringify(hidden));
        }
    };

    ctrl.hidden = function(bidNumber){
        var ret = false;
        if (localStorage.getItem('carrierHiddenCounters')){
            var hidden = JSON.parse(localStorage.getItem('carrierHiddenCounters'));
            if (hidden.indexOf(bidNumber) != -1){
                ret = true;
            }
        }
        return ret;
    };

    ctrl.showDetails = function(bid, bool){
        if (bool){
            angular.forEach(bid.locations, function(value, key){
                var stopID = value.stopID;
                if (bid.adjustments && bid.adjustments[stopID]){
                    if (bid.adjustments[stopID].newTime){
                        value.earlyTime = bid.adjustments[stopID].newTime;
                        value.lateTime = bid.adjustments[stopID].newTime;
                    }
                    if (bid.adjustments[stopID].newDate){
                        value.earlyDate = bid.adjustments[stopID].newDate;
                        value.lateDate = bid.adjustments[stopID].newDate;
                    }
                }
            });
        }
        bid.showCounter = false;
        bid.showDetails = bool;
    };

    ctrl.handling = freightFilters.handling;

    ctrl.approveCounter = function(offer){
        console.log(offer);
        basicService.put('../../node/approve-bid', offer)
        .then(function success(response){
            console.log(response);
        }, function failure(response){
            if (response.error && (response.error == 'nodr')){
                console.log("NEED DRIVER");
            } else {
                console.log(response);
            }
        });
    };

    ctrl.toggleCounter = function(offer){
        if (offer.showCounter){
            offer.showCounter = false;
            offer.counterAmount = '';
        } else {
            offer.showCounter = true;
        }
    };

    ctrl.submitCounter = function(offer){
        var bidObj = {
            bid : {
                loadNumber: offer.loadNumber,
                money: offer.counterAmount,
                weight: offer.weight,
                handling: offer.handling,
                carrier: offer.carrier,
                driver: offer.driver,
                counterTo: offer.bidNumber,
                bidAgent: JSON.parse(sessionStorage.getItem('registeredUser')).uid,
                stops: []
            }
        };
        basicService.put('../../node/new-bid', bidObj.bid)
        .then(function success(response){
            console.log(response);
        }, function failure(response){
            console.log(response);
        });
    };

    ctrl.displayCounter = {
        show: false,
        amount: null,
        toggle: function(){
            this.show = !this.show;
        },
        submit: function(offer){
            console.log(offer);
        }
    };

    ctrl.displayCounterSubmit = function(offer){
        var counterObj = {};
        var uid = JSON.parse(sessionStorage.getItem('registeredUser') || '{}').uid;
        counterObj.money = offer.counterAmount || offer.amount;
        counterObj.loadNumber = offer.loadNumber;
        counterObj.weight = offer.weight;
        counterObj.handling = offer.handling;
        counterObj.carrier = uid;
        counterObj.driver = offer.driver;
        counterObj.stops = offer.adjustments;
        counterObj.bidAgent = uid;
        basicService.post('../node/submitBid', {bid: counterObj})
        .then(function success(response){
            console.log(response);
        }, function failure(response){
            console.log(response);
        });
    };

});
app.directive('utpCarrierCounteroffers', function(){

    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'counteroffers_tmp.html',
        controller: 'carrierCounteroffersController',
        controllerAs: 'ccoCtrl'
    }

});
app.controller('loadBoardController',function($scope, $filter, basicService){

	var ctrl = this;
	var user = JSON.parse(sessionStorage.getItem('registeredUser')).uid;

	$scope.testVar = "TEST VAR";
	$scope.showModal = false;
	$scope.selectedDriver = null;

	$scope.loads = [];
	$scope.drivers = [];
	$scope.modalObject = {};

	$scope.orgState = {
		stop: 'org',
		value: ''
	};

	$scope.destState = {
		stop: 'dest',
		value: ''
	};

	$scope.orgZip = {
		stop: 'org',
		value: '',
		range: ''
	};

	$scope.destZip = {
		stop: 'dest',
		value: '',
		range: ''
	};

	$scope.minDistance = {
		value: '',
		orgZip: $scope.orgZip.value,
		destZip: $scope.destZip.value,
		min: true
	};

	$scope.maxDistance = {
		value: '',
		orgZip: $scope.orgZip.value,
		destZip: $scope.destZip.value,
		min: false
	};

	$scope.dateRange = {
		fromDate: '',
		untilDate: ''
	};

	$scope.fetchData = function(){
		$scope.fetchLoads();
		$scope.fetchDrivers();
	}

	$scope.placeBid = function(loadNumber){
		console.log(loadNumber)
		$scope.showModal = true;
		basicService.get('../node/load-details/?load=' + loadNumber)
		.then(function success(response){
			var loadObj = response.commodity ? response : response[0];
			if (typeof loadObj.stops == 'string'){
				loadObj.stops = JSON.parse(loadObj.stops);
			}
			$scope.modalObject = loadObj;
			console.log($scope.modalObject);
		}, function failure(response){
			console.log(response);
		});

	};

	$scope.fetchLoads = function(){
		basicService.get('../node/available-loads-board')
		.then(function success(data){
			var len = data.length;
			for (var i = 0; i < len; i++){
				if (typeof data[i].stops == 'string'){
					data[i].stops = JSON.parse(data[i].stops);
				}
			}
			$scope.loads = data;
		}, function error(data){
			console.error("ERROR IN RETRIEVING AVAILABLE LOADS");
			console.log(data);
		});
	};

	$scope.hideModal = function (){
		$scope.showModal = false;
	};

	$scope.fetchDrivers = function(){
		basicService.get('../node/carrier-dashboard-drivers/?user=' + user)
		.then(function success(response){
			$scope.drivers = response;
		}, function failure(response){
			console.log("FAIL");
			console.log(response);
		});
	};


});
app.directive("utpLoadBoard", function(){

	return {
		restrict: "E",
		scope: {},
		templateUrl: "loadBoard_tmp.html"
	}

});
app.filter('stateFilter', function() {

	return function( items, state ) {

		if (state.value.length != 2){
			return items;
		} else {

			var filtered = [];

			angular.forEach(items, function(item) {

				var key = !!(state.stop == 'org') ? 0 : (item.stops.length - 1);

				if (state.value.toUpperCase() == item.stops[key].state) {
					filtered.push(item);
				}

			});

			return filtered;

		}

	};

});

app.filter('zipFilter', function(){

	return function(items, zipObj){

		var filtered = [];

		if (String(zipObj.value).length != 5){
			return items;
		} else if (zipObj.range == '') {

			angular.forEach(items, function(item) {

				var key = !!(zipObj.stop == 'org') ? 0 : (item.stops.length - 1);

				if (zipObj.value == item.stops[key].zip) {
					filtered.push(item);
				}

			});

			return filtered;

		} else {

			angular.forEach(items, function(item) {

				var range = parseInt(zipObj.range);
				var key = !!(zipObj.stop == 'org') ? 0 : (item.stops.length - 1);
				var distance = parseInt(getD(zipObj.value,item.stops[key].zip));

				if (distance < range) {
					filtered.push(item);
				};

			});

			return filtered;

		}

	}

});

app.filter('distanceFilter', function() {

	return function( items, distance ) {

		if ((String(distance.value).length > 1) && (String(distance.value).length < 5)){
			var filtered = [];

			angular.forEach(items, function(item) {

				var dist = 0;

				for (var i = 0; i < item.stops.length; i++){
					if (!!item.stops[(i + 1)]){
						var org = item.stops[i].zip;
						var dest = item.stops[(i + 1)].zip;
						dist += parseInt(getD(org,dest)) * 1.15;
					} else {
						dist += 0;
					}
				}

				var desired = parseInt(distance.value);

				if (distance.min && (dist > desired)) {
					filtered.push(item);
				} else if (!distance.min && (dist < desired)) {
					filtered.push(item);
				}

			});

			return filtered;

		} else {
			return items;
		}

	};

});

app.filter('datesFilter', function($filter){

	return function(items, datesObj){

		var filtered = [];

		if (!datesObj.fromDate && !datesObj.untilDate){
			return items;
		} else if (!!datesObj.fromDate && !datesObj.untilDate){

			angular.forEach(items, function(item){

				var erlDate = $filter('date')(datesObj.fromDate,'yyyy-MM-dd');

				if (erlDate < '2016-02-28'){
					filtered.push(item);
				} else if (item.stops[0].lateDate >= erlDate){
					filtered.push(item);
				}

			});

			return filtered;

		} else if (!datesObj.fromDate && !!datesObj.untilDate){

			angular.forEach(items, function(item){

				var untDate = $filter('date')(datesObj.untilDate,'yyyy-MM-dd');


				if (untDate < '2016-02-28'){
					filtered.push(item);
				} else if (item.stops[0].earlyDate <= untDate){
					filtered.push(item);
				}

			});

			return filtered;

		} else if (!!datesObj.fromDate && !!datesObj.untilDate){

			angular.forEach(items, function(item){

				var untDate = $filter('date')(datesObj.untilDate,'yyyy-MM-dd');
				var erlDate = $filter('date')(datesObj.fromDate,'yyyy-MM-dd');

				if ((erlDate < '2016-02-28') || (untDate < '2016-02-28')){
					filtered.push(item);
				} else if ((item.stops[0].lateDate >= erlDate) && (item.stops[0].earlyDate <= untDate)){
					filtered.push(item);
				}

			});

			return filtered;

		}

	}

});

app.filter('driverFilter', function($filter, timeDateSvc){

	return function(items, dr){

		if (dr){
			return items;
			/*/var driver = JSON.parse(dr);

			var filtered = [];
			var truck = {
				time: (driver.drStatus == 1) ? driver.nextEmptyTime : null,
				date: (driver.drStatus == 1) ? $filter('date')(driver.nextEmptyDate,'yyyy-MM-dd') : null,
				zip: (driver.drStatus == 1) ? driver.nextEmptyZip : null
			};

			if (truck.date){

				angular.forEach(items, function(item){
					var pick = item.stops[0];
					var distance = getD(truck.zip,pick.zip);
					var dateDiff = timeDateSvc.differenceInDays(truck.date, pick.lateDate);
					var timeDiff = timeDateSvc.differenceInMinutes(truck.time, pick.lateTime);

					if ((dateDiff > 0) && ((distance / dateDiff) < 800)){
						filtered.push(item);
					} else if ((dateDiff == 0) && (distance / timeDiff < .85)){
						filtered.push(item);
					}
				});
				return filtered;

			} else {
				return items;
			}/*/

		} else {
			return items;
		}

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
