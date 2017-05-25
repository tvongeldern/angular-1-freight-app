app.directive('utpDriverHomeStop', function(){

    return {
        restrict: 'E',
        scope: {
            info:'=',
            load:'@',
            refresh:'='
        },
        templateUrl: 'driverHomeStop_tmp.html'
    }

});
