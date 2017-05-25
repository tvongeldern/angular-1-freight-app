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
