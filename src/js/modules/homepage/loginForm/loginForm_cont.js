app.controller("loginFormController", function($scope, userDataService){

	var ctrl = this;

	$scope.user = {
		"name": "",
		"password": ""
	};

	$scope.yell = function(){
		alert("HOWDY NEIGHBOR!");
	};

	$scope.str = userDataService.svcTestString;

	$scope.validateUser = function(){
		userDataService.verifyCredentials($scope.user.name, $scope.user.password)
		.then(function success(data){

			if (data.success){

				var userObj = {
					uid: data.userID,
					type: data.userType
				};

				sessionStorage.setItem('registeredUser', JSON.stringify(userObj));

				if (userObj.type == '1'){
					window.location.href = "http://localhost/customer";
				} else if (userObj.type == '2'){
					window.location.href = "http://localhost/carrier";
				} else if (userObj.type == '3'){
					window.location.href = "http://localhost/driver";
				}

			} else if (data.error == 'cred'){
				console.log("FAILURE - BAD CREDENTIALS");
			} else if (data.error == 'dupe'){
				console.log("FAILURE - DATABASE ERROR");
			} else {
				console.log("ELSE");
				console.log(data);
			}

		}, function error(data){
			console.log("CONNECTION ERROR");
		});
	};

});
