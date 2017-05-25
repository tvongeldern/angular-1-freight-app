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
