app.directive('utpAlert', function(){

    return {
        restrict: 'E',
        scope: {
            alert: '='
        },
        templateUrl: 'alert_tmp.html'
    }

});
