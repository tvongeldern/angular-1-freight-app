app.directive('utpDashboardTenderedLoad', function(){

    return {
        restrict: 'E',
        scope: {
            info: '='
        },
        templateUrl: 'dashboardTenderedLoad_tmp.html'
    }

});
