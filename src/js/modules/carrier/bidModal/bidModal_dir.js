app.directive('utpBidModal', function(){

	return {
		restrict: 'E',
		scope: {
			info: '=',
			drivers: '=',
			hide: '='
		},
		controller: 'bidModalController',
		controllerAs: 'bidModalCtrl',
		templateUrl: 'bidModal_tmp.html'
	}

});
