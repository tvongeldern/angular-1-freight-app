app.controller('dashboardTenderedLoadController', function($scope, $filter, timeDateSvc){

    var ctrl = this;

    $scope.statusClass = '';
    $scope.statusText = '';

    $scope.sortStops = function(){
        if (typeof $scope.info.stops == 'string'){
            $scope.info.stops = JSON.parse($scope.info.stops);
            console.log($scope.info.lastUpdate);
            $scope.info.lastUpdate = JSON.parse($scope.info.lastUpdate);
        }
        var arr = $scope.info.stops.sort(function(a,b){
            if (a.stopID < b.stopID){return -1};
            if (a.stopID > b.stopID){return +1};
            return 0;
        });
        return arr;
    };

    $scope.driverLastUpdate = function(){
        if (!$scope.info.lastUpdate){
            return null;
        } else {
            var dist = getDistance($scope.info.lastUpdate.lat, $scope.info.lastUpdate.lon, zipIndex[$scope.info.stops[0].zip].latitude, zipIndex[$scope.info.stops[0].zip].longitude).toFixed(1);
            var time = timeDateSvc.parseTime($scope.info.lastUpdate.time);
            var day = timeDateSvc.relativeDate($scope.info.lastUpdate.date);

            ctrl.pickupStatus();
            return dist + " miles from shipper at " + time + ' ' + day;
        }
    };

    ctrl.pickupStatus = function(){
        var dist = getDistance($scope.info.lastUpdate.lat, $scope.info.lastUpdate.lon, zipIndex[$scope.info.stops[0].zip].latitude, zipIndex[$scope.info.stops[0].zip].longitude).toFixed(1);
        var pickDate = $scope.info.stops[0].lateDate;
        var pickTime = $scope.info.stops[0].lateTime;
        var truckDate = $scope.info.lastUpdate.date;
        var truckTime = $scope.info.lastUpdate.time;
        var dateDiff = timeDateSvc.differenceInDays(pickDate, truckDate);
        var timeDiff = timeDateSvc.differenceInMinutes(pickTime, truckTime);
        var min = timeDiff + (dateDiff * 1440);
        var mph = (-dist/min) * 60;

        console.log("dist : " + dist + ", min : " + min);

        if (mph < 15){
            $scope.statusText = "Tracking on time";
            $scope.statusClass = "on-time";
        } else if (mph < 60){
            $scope.statusText = "Watch";
            $scope.statusClass = "cutting-close";
        } else {
            $scope.statusText = "Running late";
            $scope.statusClass = "running-late";
        }

        console.log(mph);

    };

});
