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
