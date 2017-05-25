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
