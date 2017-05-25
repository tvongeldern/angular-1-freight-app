app.directive('utpDashboardBuiltLoad', function(){

    return {
        restrict: 'E',
        scope: {
            info: '=',
            toboard: '='
        },
        templateUrl: 'dashboardBuiltLoad_tmp.html',
        controller: 'dashboardBuiltLoadController'
    }

});
