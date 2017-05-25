app.controller("loginFormController", function($scope, userDataService){

	$scope.yell = function(){
		alert("HOWDY NEIGHBOR!");
	};

	$scope.str = userDataService.svcTestString;

});
