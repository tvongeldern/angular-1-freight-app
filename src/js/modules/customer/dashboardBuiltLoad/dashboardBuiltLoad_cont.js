app.controller('dashboardBuiltLoadController', function($scope, $filter){

    var ctrl = this;

    $scope.currentUser = JSON.parse(sessionStorage.getItem('registeredUser')).uid;
    $scope.lowest = {};
    $scope.bidCount = 0;

    $scope.bids = {
        asIs: [],
        changed: []
    }

    $scope.selectedBid = {
        amount: null,
        counter: null
    };

    $scope.bidSlideout = {
        show: false,
        counter: false
    };

    $scope.bidManager = {
        show: false,
        counter: null,
        bids: [],
        selected: {},
        adjustments: {}
    };

    $scope.stopIterator = function(stopsObj){
        var str = '';
        for (var i = 0; i < stopsObj.length; i++){
            str += stopsObj[i].city + ', ' + stopsObj[i].state + ' - ';
        }
        str = str.substring(0, str.length - 3);
        return str;
    };

    $scope.sortBids = function(){
        var uid = JSON.parse(sessionStorage.getItem('registeredUser') || '{}').uid;
        if (typeof $scope.info.allBids == 'string'){
            $scope.info.allBids = JSON.parse($scope.info.allBids);
        }
        if (typeof $scope.info.stops == 'string'){
            $scope.info.stops = JSON.parse($scope.info.stops);
        }
        for (var i = 0; i < ($scope.info.allBids || []).length; i++){
            if ($scope.info.allBids[i].bidAgent != uid){
                $scope.bidCount += 1;
            }
        }
    };

    $scope.sortByAmount = function(bidArray){
        if (!!bidArray && (bidArray != null)){
            var arr = bidArray.sort(function(a,b){
                if (a.amount < b.amount){return -1};
                if (a.amount > b.amount){return +1};
                return 0;
            });
            return arr;
        } else {
            return null;
        }
    };

});
