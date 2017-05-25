app.directive('utpCarrierDashLoad', function(){

    return {
        restrict: 'E',
        scope: {
            info: '='
        },
        templateUrl: 'carrierDashLoad_tmp.html'
    }

});
