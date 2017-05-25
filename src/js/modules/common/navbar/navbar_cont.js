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
