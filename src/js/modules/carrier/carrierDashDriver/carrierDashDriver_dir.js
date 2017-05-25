app.directive('utpCarrierDashDriver', function(){

    return {
        restrict: 'E',
        scope: {
            info: '='
        },
        templateUrl: 'carrierDashDriver_tmp.html',
        controller: 'carrierDashDriverController'
    }

});
