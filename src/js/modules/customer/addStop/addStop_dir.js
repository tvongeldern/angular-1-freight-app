app.directive("utpAddStop", function(){

	return {
		restrict: "E",
		scope: {
			info: '=',
			number: '='
		},
		templateUrl: "addStop_tmp.html"
	}

});
