app.directive('utpFreightDetails', function(){

	return {
		restrict: "E",
		scope: {
			info: '='
		},
		templateUrl: "freightDetails_tmp.html"
	}

});
