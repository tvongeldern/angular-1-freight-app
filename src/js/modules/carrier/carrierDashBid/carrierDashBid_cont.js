app.controller('carrierDashBidController', function($scope, $window, $filter, freightFilters, basicService){

    var ctrl = this;

    $scope.popup = {
        show: false,
        counter: false,
        vertical: -100,
        data: {},
        submitCounter: function(){
            var bidObj = {
                    loadNumber: $scope.info.loadNumber,
                    money: $scope.popup.data.amount,
                    weight: $scope.popup.data.weight || $scope.info.weight,
                    handling: $scope.info.weight,
                    carrier: JSON.parse(sessionStorage.getItem('registeredUser')).uid,
                    driver: $scope.info.driver,
                    counterTo: $scope.info.bidNumber,
                    bidAgent: JSON.parse(sessionStorage.getItem('registeredUser')).uid,
                    stops: []
            };
            angular.forEach($scope.popup.data, function(value, key){
                if (key != 'amount'){
                    var stopObj = {
                        stopID: key
                    };
                    if (value.date){
                        stopObj.date = true;
                        stopObj.newDate = $filter('date')(value.date, 'yyyy-MM-dd');
                    }
                    if (value.time){
                        stopObj.time = true;
                        stopObj.newTime = $filter('date')(value.time, 'HH:mm');
                    }
                    bidObj.stops.push(stopObj);
                }
            });
            basicService.put('../../node/new-bid', bidObj)
            .then(function success(response){
                console.log(response);
            }, function failure(response){
                console.log(response);
            });
        }
    };

    ctrl.bidder = function(bid){
        if ((JSON.parse(sessionStorage.getItem('registeredUser')).uid == $scope.info.bidAgent) && ($scope.info.counterTo)){
            return {
                code: 1,
                desc: "Carrier Counteroffer"
            };
        } else if (!$scope.info.counterTo) {
            return {
                code: 2,
                desc: "Carrier Offer"
            };
        } else {
            return {
                code: 3,
                desc: "Customer Counteroffer"
            };
        }
    };

    ctrl.parseInfo = function(){
        if (!$scope.info.locations[0].city && !$scope.info.locations[0].state){
            $scope.drivers = JSON.parse($scope.drivers);
            $scope.info.locations = JSON.parse($scope.info.locations);
            $scope.info.original = JSON.parse($scope.info.original);
            if ($scope.info.adjustments){
                $scope.info.adjustments = JSON.parse($scope.info.adjustments);
            }
        }
    };

    ctrl.route = (function(){
        var str = $scope.info.loadNumber + " ";
        var arr = typeof $scope.info.locations == 'string' ? JSON.parse($scope.info.locations) : $scope.info.locations;
        var len = arr.length;
        for (var i = 0; i < len; i++){
            str += arr[i].city + ", " + arr[i].state + " - ";
        }
        return str.slice(0,-3);
    })();

    ctrl.changes = (function(){
        var adjustments, str = '';
        if ($scope.info.stopsAsIs && !$scope.info.weight && !$scope.info.handling){
            str += "As is";
        } else {
            if ($scope.info.weight || $scope.info.handling){
                str += "Bid ";
                if ($scope.info.weight){
                    str += "weight: " + $scope.info.weight;
                }
                if ($scope.info.weight && $scope.info.handling){
                    str += " and ";
                }
                if ($scope.info.handling){
                    str += "handling: " + freightFilters.handling($scope.info.handling);
                }
                str += $scope.info.stopsAsIs ? " " : ", ";
            }
            if (!$scope.info.stopsAsIs){
                adjustments = typeof $scope.info.adjustments == 'string' ? JSON.parse($scope.info.adjustments) : $scope.info.adjustments;
                angular.forEach(adjustments, function(value, key){
                    var city, state, action;
                    if (value.newDate || value.newTime){
                        var locations = typeof $scope.info.locations == 'string' ? JSON.parse($scope.info.locations) : $scope.info.locations;
                        var len = locations.length;
                        for (var i = 0; i < len; i++){
                            if (locations[i].stopID == key){
                                city = locations[i].city;
                                state = locations[i].state;
                                action = freightFilters.stopAction(locations[i].action, true);
                            }
                        }
                    }
                    str += action + " in " + city + ", " + state + " @ " + value.newTime//.slice(0, -3);
                    str += value.newTime ? "  " + value.newDate : value.newDate;
                    str += " ";
                });
            }
        }
        return str;
    })();

    ctrl.removeBid = function(){
        basicService.del('../../node/delete-bid/?bid=' + $scope.info.bidNumber)
        .then(function success(){
            $scope.refresh();
        }, function failure(){
            console.log("ERROR");
        });
    };

    ctrl.approveBid = function(){
        basicService.post('../../node/approve-bid', $scope.info)
        .then(function success(){
            $scope.refresh();
        }, function failure(response){
            if (response.error && (response.error == "nodr")){
                console.log("NEED DRIVER");
            } else {
                console.log("ERROR");
            }
        });
    };

    ctrl.showDetails = function(event){
        var fromBottom = $window.innerHeight - event.clientY;
        if (fromBottom < 300 && event.clientY > 300) {
            $scope.popup.vertical = -300;
        } else {
            $scope.popup.vertical = -100;
        }
        $scope.popup.show = !$scope.popup.show;
    };

    ctrl.hideDetails = function(){
        $scope.popup.show = false;
        $scope.popup.counter = false;
    };

    $scope.filters = {
        stopHeader: function(action){
            return freightFilters.stopAction(action).charAt(0).toUpperCase() + freightFilters.stopAction(action).slice(1);
        },
        location: function(stop){
            return stop.city + ', ' + stop.state + ' ' + stop.zip;
        },
        handling: function(int){
            return freightFilters.handling(int);
        }
    };

    ctrl.driverCanGet = function(driver){
        return true;
    };

    ctrl.openCounterMenu = function(){
        $scope.popup.show = true;
        $scope.popup.counter = true;
    };

});
