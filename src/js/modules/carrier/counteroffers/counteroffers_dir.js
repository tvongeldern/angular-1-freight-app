app.directive('utpCarrierCounteroffers', function(){

    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'counteroffers_tmp.html',
        controller: 'carrierCounteroffersController',
        controllerAs: 'ccoCtrl'
    }

});
