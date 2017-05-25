app.controller('carrierDashLoadController', function($scope){

    var ctrl = this;

    $scope.initialize = function(){
        if (typeof $scope.info.stops == 'string'){
            $scope.info.stops = JSON.parse($scope.info.stops);
        }
    };

    $scope.loadHeader = function(){
        return "Load Number " + $scope.info.loadNumber;
    };

});
