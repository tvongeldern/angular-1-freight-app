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
