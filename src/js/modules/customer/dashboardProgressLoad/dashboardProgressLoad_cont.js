app.controller('dashboardProgressLoadController', function($scope, freightFilters){

    var ctrl = this;

    $scope.initialize = function(){
        if (typeof $scope.info.stops == 'string'){
            $scope.info.stops = JSON.parse($scope.info.stops);
        }
    };

    $scope.loadStatus = function(){
        var status = $scope.info.stops[0].status;
        var recStatus = $scope.info.stops[($scope.info.stops.length - 1)].status;
        var text = status == 1 ? "Checked In" : status == 2 ? "Arrived" : status == 3 ? "Loading" : status == 4 ? "Loaded" : status == 5 ? "Rejected" : "Error";
        if (text == "Loaded" && recStatus == 2){
            text = "At receiver";
        } else if (text == "Loaded" && recStatus == 3){
            text = "Unloading";
        }
        return text;
    };

    $scope.stopStatus = function(stop){
        return freightFilters.stopStatus(stop);
    };

});
