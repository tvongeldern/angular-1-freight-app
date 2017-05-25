var app = angular.module("untitledProject",[]);
app.controller("addStopController", function($scope, basicService){

	var ctrl = this;

	$scope.infoObject = {};

	$scope.controllerObj = function(obj){
		$scope.infoObject = obj;
	};

	$scope.showResultsMenu = false;

	$scope.searchResults = {};

	$scope.hideSearch = function(){
		$scope.showResultsMenu = false;
	};

	$scope.clearWhs = function(whsObj){
		whsObj.whsName = '';
		whsObj.address = '';
		whsObj.address2 = '';
		whsObj.city = '';
		whsObj.state = '';
		whsObj.zip = '';
	};

	$scope.offerMatches = function(stopObj, whsNum){
		if (!whsNum){
			stopObj.whsNumber = '';
		}
		if ((stopObj.whsNumber.length > 0) || (stopObj.whsName.length > 0) || (stopObj.address.length > 0) || (stopObj.address2.length > 0) || (stopObj.city.length > 0) || (stopObj.state.length > 0) || (stopObj.zip.length > 0)){
			var url = '../node/warehouse-matches/?';
			['whsNumber', 'whsName', 'address', 'address2', 'city', 'state', 'zip'].forEach(function(item, index){
				if (stopObj[item]){
					if (url != '../node/searchWhs/?'){
						url += '&';
					}
					url += item + "=" + encodeURIComponent(stopObj[item]);
				}
			});
			basicService.get(url)
			.then(function success(response){
				$scope.showResultsMenu = true;
				$scope.searchResults = response;
			}, function error(response){
				console.error("WHS SEARCH ERROR");
				console.log(response);
			});
		} else {
			$scope.showResultsMenu = false;
		}
	};

	$scope.searchSelect = function(whsObject){
		$scope.infoObject.whsNumber = whsObject.whsNumber;
		$scope.infoObject.whsName = whsObject.whsName;
		$scope.infoObject.address = whsObject.address1;
		$scope.infoObject.address2 = whsObject.address2;
		$scope.infoObject.city = whsObject.city;
		$scope.infoObject.state = whsObject.state;
		$scope.infoObject.zip = whsObject.zip;
		$scope.hideSearch();
	};

});
app.directive("utpAddStop", function(){

	return {
		restrict: "E",
		scope: {
			info: '=',
			number: '='
		},
		templateUrl: "addStop_tmp.html"
	}

});
app.controller('bidManagerController', function($scope, $timeout, $filter, basicService, freightFilters){

    var ctrl = this;

    var uid = JSON.parse(sessionStorage.getItem('registeredUser' || '{}')).uid;

    $scope.selectedBid = null;

    ctrl.handling = freightFilters.handling;

    ctrl.stopAdjusted = function(stopNumber, bid){
        var ret;
        var len = bid ? bid.adjustments.length : 0;
        for (var i = 0; i < len; i++){
            if (bid && bid.adjustments[i].stopNumber == stopNumber){
                ret = bid.adjustments[i];
            }
        }
        if (ret){
            ret.newDate = ret.newDate && ret.newDate.match('-') ? ret.newDate : false;
            ret.newTime = ret.newTime && ret.newTime.match(':') ? ret.newTime : false;
        }
        return ret;
    };

    ctrl.select = function(bid){
        if ($scope.selectedBid){
            $scope.selectedBid.counter = false;
        }
        $scope.selectedBid = bid;
        $scope.selectedBid.counter = false;
    };

    ctrl.deleteLoad = function(loadNumber){
        basicService.del('../../node/delete-load/?load=' + loadNumber)
        .then(function(response){
            if (response.success){
                $scope.info.deleted = true;
                $scope.refreshData(1);
            } else {
                console.error("DELETE FAILED");
            }
        });
    };

    ctrl.approveBid = function(){
        var data = {
            amount: $scope.selectedBid.amount,
            carrier: uid,
            bidNumber: $scope.selectedBid.bidNumber,
            handling: $scope.selectedBid.handling,
            loadNumber: $scope.info.loadNumber,
            stopsAsIs: $scope.selectedBid.stopsAsIs,
            weight: $scope.selectedBid.weight,
            driver: $scope.selectedBid.driver
        };
        basicService.post('../node/approve-bid', data)
        .then(function success(response){
            console.log("SUCCESS");
            console.log(response);
            $scope.refreshData(1);
            $scope.info.approved = true;
        }, function failure(response){
            console.log("ERROR");
            console.log(response);
        });
    };

    ctrl.prepareCounter = function(){
        $scope.selectedBid.counter = true;
        $scope.selectedBid.bidAdjustments = {};
    };

    ctrl.loadWeightClass = function (a, b){
        if (a == b || !b || !a){
            return 'load-weight';
        } else {
            return 'load-weight counter-figure';
        }
    };

    ctrl.createBidAdj = function(stopNumber){
        $scope.selectedBid.bidAdjustments[stopNumber] = {
            date: null,
            time: null
        };
    };

    ctrl.submitCounter = function(){
        var counter = {
            loadNumber: $scope.selectedBid.loadNumber,
            money: $scope.selectedBid.counterAmount,
            weight: $scope.selectedBid.weight,
            handling: $scope.selectedBid.handling,
            carrier: $scope.selectedBid.carrier,
            driver: $scope.selectedBid.driver,
            counterTo: $scope.selectedBid.bidNumber,
            bidAgent: uid,
            stops: []
        };
        angular.forEach($scope.selectedBid.bidAdjustments, function(v, k){
            var obj = {
                stopID: k,
                newDate: $filter('date')(v.date, 'yyyy-MM-dd') || ctrl.stopAdjusted(k, $scope.selectedBid).newDate || null,
                newTime: $filter('date')(v.time, 'HH:mm') || ctrl.stopAdjusted(k, $scope.selectedBid).newTime || null
            };
            obj.date = !!obj.newDate;
            obj.time = !!obj.newTime;
            counter.stops.push(obj);
        });
        basicService.put('../node/new-bid', {bid: counter})
        .then(function success(response){
            if (response.success){
                $scope.refreshData(1)
                ctrl.select($scope.selectedBid);
            } else {
                console.error("ERROR: Bid not submitted");
            }
        }, function failure(response){
            console.log("ERROR");
        });
    };

    ctrl.clearSelected = function(){
        $scope.selectedBid = null;
    };

    ctrl.isIncoming = function(bid){
        var usr = uid;
        if (bid.bidAgent == usr){
            markCountered(bid.counterTo);
        }
        return (bid.bidAgent != usr);
    };

    ctrl.bidClass = function(bid){
        if (bid.countered){
            return 'countered';
        } else if (!bid.weight && !bid.handling && (bid.stopsAsIs == 1)){
            return '';
        } else {
            return 'adjusted';
        }
    };

    function markCountered(bidNum){
        var len = $scope.info.allBids.length;
        for (var i = 0; i < len; i++){
            if ($scope.info.allBids[i].bidNumber == bidNum){
                $scope.info.allBids[i].countered = true;
            }
        }
    };

});
app.directive('utpCustomerBidManager', function(){

    return {
        restrict: 'E',
        scope: {
            info: '=',
            refreshData:'='
        },
        templateUrl: 'bidManager_tmp.html',
        controller: 'bidManagerController',
        controllerAs: 'bidMgrCtrl'
    }

});
app.controller("buildLoadController", function($scope, $filter, basicService){

	var ctrl = this;

	$scope.modalVisible = false;
	$scope.createWhsModalVar = 0;
	$scope.buildLoadError = null;

	$scope.createWhsModal = {
		content: "MODAL",
		hideModal: function(){
			$scope.modalVisible = false;
		}
	};

	$scope.showModal = function(input){
		var stop = parseInt(input) - 1;
		$scope.createWhsModalVar = stop;
		$scope.modalVisible = true;
	};

	$scope.confModal = {
		show: false,
		content: ''
	};

	$scope.stops = [
		{
			content: 1,
			whsNumber: '',
			whsName: '',
			address: '',
			address2: '',
			city: '',
			state: '',
			zip: '',
			phone: '',
			email: '',
			transpoMgr: '',
			genOpen: '',
			genClose: '',
			genApt: '',
			lumper: '',
			opsMgmt: '',
			shipPhone: '',
			shipEmail: '',
			shipMgr: '',
			shipOpen: '',
			shipClose: '',
			shipApt: '',
			recPhone: '',
			recEmail: '',
			recMgr: '',
			recOpen: '',
			recClose: '',
			recApt: '',
			action: '0',
			readyDate: '',
			readyTime: '',
			deadlineDate: '',
			deadlineTime: '',
			openModal: $scope.showModal,
			deleteStop: function(number){deleteStop(number)},
			hideModal: function(){$scope.modalVisible = false}
		}
	];

	$scope.addStop = function(){
		if ($scope.stops.length < 5){
			$scope.stops.push({
				content: $scope.stops.length + 1,
				whsName: '',
				whsNumber: '',
				address: '',
				address2: '',
				city: '',
				state: '',
				zip: '',
				phone: '',
				email: '',
				transpoMgr: '',
				genOpen: '',
				genClose: '',
				genApt: '',
				lumper: '',
				opsMgmt: '',
				shipPhone: '',
				shipEmail: '',
				shipMgr: '',
				shipOpen: '',
				shipClose: '',
				shipApt: '',
				recPhone: '',
				recEmail: '',
				recMgr: '',
				recOpen: '',
				recClose: '',
				recApt: '',
				action: '1',
				readyDate: '',
				readyTime: '',
				deadlineDate: '',
				deadlineTime: '',
				deleteStop: function(number){deleteStop(number)},
				openModal: $scope.showModal,
				hideModal: function(){$scope.modalVisible = false}
			});
		}
	};

	$scope.freight = {
		commodity: '0',
		weight: '',
		handling: '0',
		hazmat: false,
		unNumber: ''
	};

	$scope.submitLoad = function(){

		if (validateLoadInfo()){

			var load = {
				stops: []
			};

			load.freight = $scope.freight;

			for (var i = 0; i < $scope.stops.length; i++){

				var stop = {};

				stop.action = $scope.stops[i].action;
				stop.whsNumber = $scope.stops[i].whsNumber;

				stop.readyTime = $filter('date')($scope.stops[i].readyTime,'H:mm');
				stop.deadlineTime = $filter('date')($scope.stops[i].deadlineTime,'H:mm');

				stop.readyDate = $filter('date')($scope.stops[i].readyDate, 'yyyy-MM-dd');
				stop.deadlineDate = $filter('date')($scope.stops[i].deadlineDate, 'yyyy-MM-dd');

				load.stops.push(stop);
			};

			if (load.freight.hazmat == false){
				load.freight.hazmat = '0';
			} else {
				load.freight.hazmat = '1';
			};

			load.freight.customer = JSON.parse(sessionStorage.getItem('registeredUser')).uid;

			basicService.put('../node/new-load', load)
			.then(function(response){
				console.log(response);
				clearAll();
				$scope.confModal.show = true;
				$scope.confModal.content = "Your new load number " + response.insertID + " has been submitted and is now available for bidding";
			}, function(response){
				console.error("LOAD SUBMISSION ERROR");
				console.log(response);
			});

		} else {
			console.log("INSUFFICIENT INFO");
		}
	};

	function deleteStop(number){
		if ($scope.stops.length > 1){
			$scope.stops.splice(number - 1, 1);
		}
	};

	function validateLoadInfo(){
		var len = $scope.stops.length,
			picks = 0,
			drops = 0;

		$scope.buildLoadError = null;

		if (len == 0){
			errorAlert("Please enter stops");
			return false;
		} else if (parseInt($scope.stops[0].action) == 1){
			errorAlert("The first stop cannot be a delivery");
			return false;
		} else if (!$scope.freight.weight) {
			errorAlert("Please enter load weight");
			return false;
		} else if (parseInt($scope.freight.weight) > 47000) {
			errorAlert("Load is too heavy");
			return false;
		} else if (!$scope.freight.handling) {
			errorAlert("Please enter load handling");
			return false;
		} else if (!$scope.freight.commodity) {
			errorAlert("Please enter load commodity");
			return false;
		} else if (!$scope.freight.unNumber && $scope.freight.hazmat) {
			errorAlert("Please enter HAZMAT UN Number");
			return false;
		} else {
			for (var i = 0; i < len; i++){
				var stop = $scope.stops[i];
				if (parseInt(stop.action) == 0){
					picks += 1;
				} else if (parseInt(stop.action) == 1){
					drops += 1;
				}

				if (!stop.whsNumber){
					errorAlert("Make sure that all stops have a warehouse number");
					clearStopWhs(stop);
					return false;
				} else if (!stop.whsName){
					errorAlert("Make sure that all stops have a warehouse name");
					clearStopWhs(stop);
					return false;
				} else if (!stop.address){
					errorAlert("Make sure that all stops have an address");
					clearStopWhs(stop);
					return false;
				} else if (!stop.city || !stop.state || !stop.zip){
					errorAlert("Make sure that all stops have a city, state, and ZIP");
					clearStopWhs(stop);
					return false;
				} else if (!stop.readyDate){
					errorAlert("Make sure that all stops have a ready date");
					clearStopDates(stop);
					return false;
				} else if (!stop.readyTime){
					errorAlert("Make sure that all stops have a ready time");
					clearStopDates(stop);
					return false;
				} else if (!stop.deadlineDate){
					errorAlert("Make sure that all stops have a deadline date");
					clearStopDates(stop);
					return false;
				} else if (!stop.deadlineTime){
					errorAlert("Make sure that all stops have a deadline time");
					clearStopDates(stop);
					return false;
				}

			}

			if (picks == 0 || drops == 0){
				errorAlert("For a load to be valid, there must be at least one pick and one delivery");
				return false;
			} else {
				return true;
			}
		}

	};

	 function clearStopWhs(stop){
		stop.whsNumber = '';
		stop.whsName = '';
		stop.address = '';
		stop.address2 = '';
		stop.city = '';
		stop.state = '';
		stop.zip = '';
	};

	function clearStopDates(stop){
		stop.readyDate = null;
		stop.readyTime = null;
		stop.deadlineDate = null;
		stop.deadlineTime = null;
	};

	function errorAlert(message){
		$scope.buildLoadError = message;
	};

	function clearAll(){
		for (var i = 0; i < $scope.stops.length; i++){
			clearStopWhs($scope.stops[i]);
			clearStopDates($scope.stops[i]);
		}
		$scope.freight = {
			commodity: '0',
			weight: '',
			handling: '0',
			hazmat: false,
			unNumber: ''
		};
	};

});
app.directive("utpBuildLoad", function(){

	return {
		restrict: "E",
		scope: {},
		templateUrl: "buildLoad_tmp.html"
	}

});
app.controller("createWhsModalController", function($scope, $filter, basicService, googleAPI){

	var ctrl = this;

	$scope.page1 = {
		exists: true,
		show: true
	};

	$scope.page2 = {
		exists: false,
		show: false
	};

	$scope.buildWhsError = null;

	$scope.submitFormData = function(obj){
		var data = Object.assign({}, obj);
		if (!data.whsName || data.whsName.length < 4){
			$scope.buildWhsError = "Please complete the warehouse name";
		} else if (!data.address1 || data.address1.length < 1){
			$scope.buildWhsError = "Please enter warehouse address";
		} else if (!data.city || data.city.length < 2){
			$scope.buildWhsError = "Please enter warehouse city";
		} else if (!data.state || data.state.length != 2){
			$scope.buildWhsError = "Please enter warehouse state as a two-digit postal code";
		} else if (!data.zip || String(data.zip).length !=5){
			$scope.buildWhsError = "Please enter warehouse zip code";
		} else if (!data.phone || strip(data.phone, true).length != 10){
			$scope.buildWhsError = "Please enter warehouse phone number";
		} else if (!data.transpoMgr){
			$scope.buildWhsError = "Please enter transportation manager name, or at least a contact who knows warehouse shipping and receiving procedures";
		} else if (!data.opsMgmt){
			$scope.buildWhsError = "Please select option that best describes warehouse operations management";
		} else if (!data.genOpen){
			$scope.buildWhsError = (data.opsMgmt == 2) ? "Please enter office open time" : "Please enter warehouse open time";
		} else if (!data.genClose){
			$scope.buildWhsError = (data.opsMgmt == 2) ? "Please enter office close time" : "Please enter warehouse close time";
		} else if (!data.lumpers){
			$scope.buildWhsError = "Please select option that best describes warehouse lumpers procedure";
		} else if ((data.opsMgmt == 1) && (!data.genApt)){
			$scope.buildWhsError = "Please select option that best describes warehouse appointment policy";
		} else if ((data.opsMgmt == 2) && (!data.shipPhone)){
			$scope.buildWhsError = "Please shipping department phone number";
		} else if ((data.opsMgmt == 2) && (!data.shipMgr)){
			$scope.buildWhsError = "Please enter shipping manager name, or at least a contact who knows warehouse shipping procedures";
		} else if ((data.opsMgmt == 2) && (!data.shipApt)){
			$scope.buildWhsError = "Please select option that best describes shipping appointment policy";
		} else if ((data.opsMgmt == 2) && (!data.shipOpen)){
			$scope.buildWhsError = "Please enter shipping open time";
		} else if ((data.opsMgmt == 2) && (!data.shipClose)){
			$scope.buildWhsError = "Please enter shipping close time";
		} else if ((data.opsMgmt == 2) && (!data.recPhone)){
			$scope.buildWhsError = "Please receiving department phone number";
		} else if ((data.opsMgmt == 2) && (!data.recMgr)){
			$scope.buildWhsError = "Please enter receiving manager name, or at least a contact who knows warehouse shipping procedures";
		} else if ((data.opsMgmt == 2) && (!data.recApt)){
			$scope.buildWhsError = "Please select option that best describes receiving appointment policy";
		} else if ((data.opsMgmt == 2) && (!data.recOpen)){
			$scope.buildWhsError = "Please enter receiving open time";
		} else if ((data.opsMgmt == 2) && (!data.recClose)){
			$scope.buildWhsError = "Please enter receiving close time";
		} else {
			data.phone = strip(obj.phone);
			data.shipPhone = strip(obj.shipPhone);
			data.recPhone = strip(obj.recPhone);
			data.genOpen = $filter('date')(obj.genOpen,'H:mm:ss');
			data.genClose = $filter('date')(obj.genClose,'H:mm:ss');
			data.shipOpen = $filter('date')(obj.shipOpen,'H:mm:ss');
			data.shipClose = $filter('date')(obj.shipClose,'H:mm:ss');
			data.recOpen = $filter('date')(obj.recOpen,'H:mm:ss');
			data.recClose = $filter('date')(obj.recClose,'H:mm:ss');

			googleAPI.addressCheck(data.address1, data.city, data.state)
			.then(function(response){
				if (!response.exactMatch){
					if (response.street_number && response.route){
						data.address1 = obj.address1 = response.street_number && response.route ? response.street_number + " " + response.route : '';
						data.city = obj.city = response.locality || '';
						data.state = obj.state = response.administrative_area_level_1 || '';
						data.zip = obj.zip = response.postal_code || '';
						$scope.buildWhsError = "Address has been verified, but minor details have been adjusted. Please review and re-submit.";
					} else {
						warehouseNoMatch();
					}
				} else {
					basicService.put('../node/new-warehouse', data)
					.then(function(response){
						$scope.info.whsNumber = response.insertID;
						$scope.info.hideModal();
					}, function(response){
						console.error("ERROR");
						console.log(response);
					});
				}
			})
			.catch(function(response){
				if (response.error != 'connection'){
					warehouseNoMatch();
				}
			});

		}
	};

	$scope.phoneInput = function(arg){
		var str = strip($scope.info[arg], true);
		var num = strip($scope.info[arg]);
		if (num > 99999) {
			$scope.info[arg] = "(" + str.substring(0,3) + ") - " + str.substring(3,6) + " - " + str.substring(6,str.length);
		} else if (num > 99) {
			$scope.info[arg] = "(" + str.substring(0,3) + ") - " + str.substring(3,str.length);
		}
		while ($scope.info[arg].length > 18){
			$scope.info[arg] = $scope.info[arg].substring(0, $scope.info[arg].length - 1);
		}
	};

	function strip(input, stringBool){
		var str = String(input).replace(/\D/g,'');
		if (stringBool && str){
			return String(str);
		} else if (str){
			return parseInt(str);
		} else {
			return '';
		}
	};

	function warehouseNoMatch(){
		$scope.buildWhsError = "The address you submitted could not be verified. Please try again.";
	};

});
app.directive("utpCreateWhsModal", function(){

	return {
		restrict: "E",
		scope: {
			info: '='
		},
		templateUrl: "createWhsModal_tmp.html",
		controller: 'createWhsModalController'
	}

});
app.controller('dashboardController', function($scope, basicService, viewport){

	var ctrl = this;
	var user = JSON.parse(sessionStorage.getItem("registeredUser") || '{}').uid;

	$scope.available = [];
	$scope.tendered = [];
	$scope.transit = [];
	$scope.delivered = [];
	$scope.searchVar = '';
	$scope.bidManager = {
		load: null,
		mount: function(load){
			$scope.bidManager.load = load;
		}
	};

	$scope.tabVar = 1;

	$scope.showTab = function(input){
		$scope.tabVar = input;
		var loadStatus = tabArray[input];
		getLoads(loadStatus);
	};

	var tabArray = [0, 'available', 'tendered', 'transit', 'delivered'];

	function getLoads(sts){
		basicService.get('../node/customer-' + sts + '-loads/?customer=' + user)
		.then(function success(response){
			$scope[sts] = response;
		}, function error(response){
			console.log("ERROR");
		});
	};

	ctrl.isMobile = viewport.isMobile();

});
app.directive('utpDashboard', function(){

	return {
		restrict: 'E',
		scope: {},
		templateUrl: 'dashboard_tmp.html',
		controller: 'dashboardController',
		controllerAs: 'dshbrd'
	}

});
app.controller('dashboardBuiltLoadController', function($scope, $filter){

    var ctrl = this;

    $scope.currentUser = JSON.parse(sessionStorage.getItem('registeredUser')).uid;
    $scope.lowest = {};
    $scope.bidCount = 0;

    $scope.bids = {
        asIs: [],
        changed: []
    }

    $scope.selectedBid = {
        amount: null,
        counter: null
    };

    $scope.bidSlideout = {
        show: false,
        counter: false
    };

    $scope.bidManager = {
        show: false,
        counter: null,
        bids: [],
        selected: {},
        adjustments: {}
    };

    $scope.stopIterator = function(stopsObj){
        var str = '';
        for (var i = 0; i < stopsObj.length; i++){
            str += stopsObj[i].city + ', ' + stopsObj[i].state + ' - ';
        }
        str = str.substring(0, str.length - 3);
        return str;
    };

    $scope.sortBids = function(){
        var uid = JSON.parse(sessionStorage.getItem('registeredUser') || '{}').uid;
        if (typeof $scope.info.allBids == 'string'){
            $scope.info.allBids = JSON.parse($scope.info.allBids);
        }
        if (typeof $scope.info.stops == 'string'){
            $scope.info.stops = JSON.parse($scope.info.stops);
        }
        for (var i = 0; i < ($scope.info.allBids || []).length; i++){
            if ($scope.info.allBids[i].bidAgent != uid){
                $scope.bidCount += 1;
            }
        }
    };

    $scope.sortByAmount = function(bidArray){
        if (!!bidArray && (bidArray != null)){
            var arr = bidArray.sort(function(a,b){
                if (a.amount < b.amount){return -1};
                if (a.amount > b.amount){return +1};
                return 0;
            });
            return arr;
        } else {
            return null;
        }
    };

});
app.directive('utpDashboardBuiltLoad', function(){

    return {
        restrict: 'E',
        scope: {
            info: '=',
            toboard: '='
        },
        templateUrl: 'dashboardBuiltLoad_tmp.html',
        controller: 'dashboardBuiltLoadController'
    }

});
app.controller('dashboardProgressLoadController', function($scope, freightFilters){

    var ctrl = this;

    $scope.initialize = function(){
        if (typeof $scope.info.stops == 'string'){
            $scope.info.stops = JSON.parse($scope.info.stops);
        }
    };

    $scope.loadStatus = function(){
        var status = $scope.info.stops[0].status;
        var recStatus = $scope.info.stops[($scope.info.stops.length - 1)].status;
        var text = status == 1 ? "Checked In" : status == 2 ? "Arrived" : status == 3 ? "Loading" : status == 4 ? "Loaded" : status == 5 ? "Rejected" : "Error";
        if (text == "Loaded" && recStatus == 2){
            text = "At receiver";
        } else if (text == "Loaded" && recStatus == 3){
            text = "Unloading";
        }
        return text;
    };

    $scope.stopStatus = function(stop){
        return freightFilters.stopStatus(stop);
    };

});
app.directive('utpDashboardProgressLoad', function(){

    return {
        restrict: 'E',
        scope: {
            info:'='
        },
        templateUrl: 'dashboardProgressLoad_tmp.html'
    }

});
/*/app.service('dashboardProgressLoadSvc', function($http, $q){



});/*/
app.controller('dashboardTenderedLoadController', function($scope, $filter, timeDateSvc){

    var ctrl = this;

    $scope.statusClass = '';
    $scope.statusText = '';

    $scope.sortStops = function(){
        if (typeof $scope.info.stops == 'string'){
            $scope.info.stops = JSON.parse($scope.info.stops);
            console.log($scope.info.lastUpdate);
            $scope.info.lastUpdate = JSON.parse($scope.info.lastUpdate);
        }
        var arr = $scope.info.stops.sort(function(a,b){
            if (a.stopID < b.stopID){return -1};
            if (a.stopID > b.stopID){return +1};
            return 0;
        });
        return arr;
    };

    $scope.driverLastUpdate = function(){
        if (!$scope.info.lastUpdate){
            return null;
        } else {
            var dist = getDistance($scope.info.lastUpdate.lat, $scope.info.lastUpdate.lon, zipIndex[$scope.info.stops[0].zip].latitude, zipIndex[$scope.info.stops[0].zip].longitude).toFixed(1);
            var time = timeDateSvc.parseTime($scope.info.lastUpdate.time);
            var day = timeDateSvc.relativeDate($scope.info.lastUpdate.date);

            ctrl.pickupStatus();
            return dist + " miles from shipper at " + time + ' ' + day;
        }
    };

    ctrl.pickupStatus = function(){
        var dist = getDistance($scope.info.lastUpdate.lat, $scope.info.lastUpdate.lon, zipIndex[$scope.info.stops[0].zip].latitude, zipIndex[$scope.info.stops[0].zip].longitude).toFixed(1);
        var pickDate = $scope.info.stops[0].lateDate;
        var pickTime = $scope.info.stops[0].lateTime;
        var truckDate = $scope.info.lastUpdate.date;
        var truckTime = $scope.info.lastUpdate.time;
        var dateDiff = timeDateSvc.differenceInDays(pickDate, truckDate);
        var timeDiff = timeDateSvc.differenceInMinutes(pickTime, truckTime);
        var min = timeDiff + (dateDiff * 1440);
        var mph = (-dist/min) * 60;

        console.log("dist : " + dist + ", min : " + min);

        if (mph < 15){
            $scope.statusText = "Tracking on time";
            $scope.statusClass = "on-time";
        } else if (mph < 60){
            $scope.statusText = "Watch";
            $scope.statusClass = "cutting-close";
        } else {
            $scope.statusText = "Running late";
            $scope.statusClass = "running-late";
        }

        console.log(mph);

    };

});
app.directive('utpDashboardTenderedLoad', function(){

    return {
        restrict: 'E',
        scope: {
            info: '='
        },
        templateUrl: 'dashboardTenderedLoad_tmp.html'
    }

});
app.controller('freightDetailsController', function($scope){

	var ctrl = this;

	$scope.commText = false;

	$scope.textTest = function(commodity){

	};

	$scope.selectTest = function(commodity){
		if (commodity == '1' || commodity == '2' || commodity == '3' || commodity == '4'){
			$scope.commText = false;
		} else {
			$scope.commText = true;
		}
		
	};

});
app.directive('utpFreightDetails', function(){

	return {
		restrict: "E",
		scope: {
			info: '='
		},
		templateUrl: "freightDetails_tmp.html"
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
