app.directive('utpDashboard', function(){

	return {
		restrict: 'E',
		scope: {},
		templateUrl: 'dashboard_tmp.html',
		controller: 'dashboardController',
		controllerAs: 'dshbrd'
	}

});
