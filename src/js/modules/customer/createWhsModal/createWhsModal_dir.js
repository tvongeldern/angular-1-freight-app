app.directive("utpCreateWhsModal", function(){

	return {
		restrict: "E",
		scope: {
			info: '='
		},
		templateUrl: "createWhsModal_tmp.html",
		controller: 'createWhsModalController'
	}

});
