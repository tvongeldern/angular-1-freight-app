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
