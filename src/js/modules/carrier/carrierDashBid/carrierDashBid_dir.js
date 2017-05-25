app.directive('utpCarrierDashBid', function(){

    return {
        restrict: 'E',
        scope: {
            info: '=',
            drivers: '@',
            refresh: '='
        },
        controller: 'carrierDashBidController',
        controllerAs: 'cdbCtrl',
        templateUrl: 'carrierDashBid_tmp.html'
    }

});
