app.directive('utpDashboardProgressLoad', function(){

    return {
        restrict: 'E',
        scope: {
            info:'='
        },
        templateUrl: 'dashboardProgressLoad_tmp.html'
    }

});
