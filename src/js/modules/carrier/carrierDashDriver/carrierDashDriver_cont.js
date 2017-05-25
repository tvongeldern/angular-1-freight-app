app.controller('carrierDashDriverController', function($scope, timeDateSvc, googleAPI){

    var ctrl = this;

    function initialize(){
        if (typeof $scope.info.tenderedLoad == 'string'){
            $scope.info.tenderedLoad = JSON.parse($scope.info.tenderedLoad);
        }
        if (typeof $scope.info.transitLoad == 'string'){
            $scope.info.transitLoad = JSON.parse($scope.info.transitLoad);
        }
        if (typeof $scope.info.upData == 'string'){
            $scope.info.upData = JSON.parse($scope.info.upData);
        }
        displayUpdate();
    };

    function displayUpdate(){
        var update = $scope.info.upData;
        if (!update){
            $scope.latestUpdate =  "Not Available";
        } else if ($scope.info.transitLoad) {
            var load = $scope.info.transitLoad || {};
            var stop = load.stops[0];
            if ($scope.info.transitLoad){
                var len = $scope.info.transitLoad ? $scope.info.transitLoad.stops.length : 0;
                for (var i = 0; i < len; i++){
                    if ($scope.info.transitLoad.stops[i].status == 1){
                        stop = $scope.info.transitLoad.stops[i];
                    }
                }
            }
            var distance = getDistance(update.lat, update.lon, zipIndex[stop.zip].latitude, zipIndex[stop.zip].longitude).toFixed(1);
            $scope.latestUpdate = distance + " miles from " + stop.city + ", " + stop.state + " at " + timeDateSvc.parseTime(update.time) + " " + timeDateSvc.relativeDate(update.date);
        } else {
            googleAPI.reverseGeocode(update.lat, update.lon)
            .then(function success(response){
                var city,state,
                    obj = response.results[0].address_components,
                    len = obj.length;
                for (var i = 0; i < len; i++){
                    if (city && state){
                        break;
                    } else if (obj[i].types.indexOf('political') >= 0 && obj[i].types.indexOf('locality') >= 0) {
                        city = obj[i].short_name;
                    } else if (obj[i].types.indexOf('political') >= 0 && obj[i].types.indexOf("administrative_area_level_1") >= 0) {
                        state = obj[i].short_name;
                    }
                }
                ret = city + ", " + state + " at " + timeDateSvc.parseTime(update.time) + " " + timeDateSvc.relativeDate(update.date);
                $scope.latestUpdate = ret;
            }, function failure(response){
                console.error(response);
                $scope.latestUpdate = "ERROR with googleAPI";
            });
        }
    };

    $scope.returnHeader = function(load){
        var str = load.loadNumber + " - ";
        var len = load.stops.length;
        for (var i = 0; i < len; i++){
            str += load.stops[i].city + ", " + load.stops[i].state + " - ";
        }
        return str.slice(0, -3) + " (" + returnStatus(load) + ")";
    };

    function returnStatus (load){
        if (load.status == 1){
            return "Not Yet Started";
        } else if (load.stops[0].status == 1){
            return "Checked In";
        } else if (load.stops[0].status == 2){
            return "At Shipper";
        } else if (load.stops[0].status == 3){
            return "Loading";
        } else if (load.stops[(load.stops.length - 1)].status < 2){
            return "In Progress";
        } else if (load.stops[(load.stops.length - 1)].status == 2){
            return "At Receiver";
        } else if (load.stops[(load.stops.length - 1)].status == 3){
            return "Unloading";
        } else {
            return "Error";
        }
    };

    initialize();

});
