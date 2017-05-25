app.controller('bidManagerController', function($scope, $timeout, $filter, basicService, freightFilters){

    var ctrl = this;

    var uid = JSON.parse(sessionStorage.getItem('registeredUser' || '{}')).uid;

    $scope.selectedBid = null;

    ctrl.handling = freightFilters.handling;

    ctrl.stopAdjusted = function(stopNumber, bid){
        var ret;
        var len = bid ? bid.adjustments.length : 0;
        for (var i = 0; i < len; i++){
            if (bid && bid.adjustments[i].stopNumber == stopNumber){
                ret = bid.adjustments[i];
            }
        }
        if (ret){
            ret.newDate = ret.newDate && ret.newDate.match('-') ? ret.newDate : false;
            ret.newTime = ret.newTime && ret.newTime.match(':') ? ret.newTime : false;
        }
        return ret;
    };

    ctrl.select = function(bid){
        if ($scope.selectedBid){
            $scope.selectedBid.counter = false;
        }
        $scope.selectedBid = bid;
        $scope.selectedBid.counter = false;
    };

    ctrl.deleteLoad = function(loadNumber){
        basicService.del('../../node/delete-load/?load=' + loadNumber)
        .then(function(response){
            if (response.success){
                $scope.info.deleted = true;
                $scope.refreshData(1);
            } else {
                console.error("DELETE FAILED");
            }
        });
    };

    ctrl.approveBid = function(){
        var data = {
            amount: $scope.selectedBid.amount,
            carrier: uid,
            bidNumber: $scope.selectedBid.bidNumber,
            handling: $scope.selectedBid.handling,
            loadNumber: $scope.info.loadNumber,
            stopsAsIs: $scope.selectedBid.stopsAsIs,
            weight: $scope.selectedBid.weight,
            driver: $scope.selectedBid.driver
        };
        basicService.post('../node/approve-bid', data)
        .then(function success(response){
            console.log("SUCCESS");
            console.log(response);
            $scope.refreshData(1);
            $scope.info.approved = true;
        }, function failure(response){
            console.log("ERROR");
            console.log(response);
        });
    };

    ctrl.prepareCounter = function(){
        $scope.selectedBid.counter = true;
        $scope.selectedBid.bidAdjustments = {};
    };

    ctrl.loadWeightClass = function (a, b){
        if (a == b || !b || !a){
            return 'load-weight';
        } else {
            return 'load-weight counter-figure';
        }
    };

    ctrl.createBidAdj = function(stopNumber){
        $scope.selectedBid.bidAdjustments[stopNumber] = {
            date: null,
            time: null
        };
    };

    ctrl.submitCounter = function(){
        var counter = {
            loadNumber: $scope.selectedBid.loadNumber,
            money: $scope.selectedBid.counterAmount,
            weight: $scope.selectedBid.weight,
            handling: $scope.selectedBid.handling,
            carrier: $scope.selectedBid.carrier,
            driver: $scope.selectedBid.driver,
            counterTo: $scope.selectedBid.bidNumber,
            bidAgent: uid,
            stops: []
        };
        angular.forEach($scope.selectedBid.bidAdjustments, function(v, k){
            var obj = {
                stopID: k,
                newDate: $filter('date')(v.date, 'yyyy-MM-dd') || ctrl.stopAdjusted(k, $scope.selectedBid).newDate || null,
                newTime: $filter('date')(v.time, 'HH:mm') || ctrl.stopAdjusted(k, $scope.selectedBid).newTime || null
            };
            obj.date = !!obj.newDate;
            obj.time = !!obj.newTime;
            counter.stops.push(obj);
        });
        basicService.put('../node/new-bid', {bid: counter})
        .then(function success(response){
            if (response.success){
                $scope.refreshData(1)
                ctrl.select($scope.selectedBid);
            } else {
                console.error("ERROR: Bid not submitted");
            }
        }, function failure(response){
            console.log("ERROR");
        });
    };

    ctrl.clearSelected = function(){
        $scope.selectedBid = null;
    };

    ctrl.isIncoming = function(bid){
        var usr = uid;
        if (bid.bidAgent == usr){
            markCountered(bid.counterTo);
        }
        return (bid.bidAgent != usr);
    };

    ctrl.bidClass = function(bid){
        if (bid.countered){
            return 'countered';
        } else if (!bid.weight && !bid.handling && (bid.stopsAsIs == 1)){
            return '';
        } else {
            return 'adjusted';
        }
    };

    function markCountered(bidNum){
        var len = $scope.info.allBids.length;
        for (var i = 0; i < len; i++){
            if ($scope.info.allBids[i].bidNumber == bidNum){
                $scope.info.allBids[i].countered = true;
            }
        }
    };

});
