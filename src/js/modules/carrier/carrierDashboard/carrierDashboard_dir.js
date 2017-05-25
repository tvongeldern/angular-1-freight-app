app.directive('utpCarrierDashboard', function(){

    return {
        restrict: 'E',
        scope: {},
        controller: 'carrierDashboardController',
        controllerAs: 'crCtrl',
        templateUrl: 'carrierDashboard_tmp.html'
    }

});
