app.directive("utpModal", function(){

	return {
		restrict: "E",
        transclude: true,
		scope: {
            modalWidth:'@',
            modalHeight:'@',
            showModal:'='
        },
		templateUrl: "modal_tmp.html",
        controller: 'modalController',
		controllerAs: 'modal'
	}

});
