app.controller('carrierCounteroffersController', function($scope, basicService, freightFilters){

    var ctrl = this;

    $scope.offers = [];

    ctrl.fetchOffers = function(){
        basicService.get('../../node/carrier-counteroffers/?uid=' + JSON.parse(sessionStorage.getItem('registeredUser') || '{}').uid)
        .then(function success(response){
            $scope.offers = response;
            for (var i = 0; i < response.length; i++){
                if ($scope.offers[i].adjustments){
                    $scope.offers[i].adjustments = JSON.parse($scope.offers[i].adjustments);
                }
                if ($scope.offers[i].locations){
                    $scope.offers[i].locations = JSON.parse($scope.offers[i].locations);
                }
            }
        }, function failure(response){
            console.log(response);
        });
    };

    ctrl.closeOffer = function(bidNumber){
        if (!localStorage.getItem('carrierHiddenCounters')){
            var arr = [];
            arr.push(bidNumber);
            localStorage.setItem('carrierHiddenCounters', JSON.stringify(arr));
        } else {
            var hidden = JSON.parse(localStorage.getItem('carrierHiddenCounters'));
            hidden.push(bidNumber);
            localStorage.setItem('carrierHiddenCounters', JSON.stringify(hidden));
        }
    };

    ctrl.hidden = function(bidNumber){
        var ret = false;
        if (localStorage.getItem('carrierHiddenCounters')){
            var hidden = JSON.parse(localStorage.getItem('carrierHiddenCounters'));
            if (hidden.indexOf(bidNumber) != -1){
                ret = true;
            }
        }
        return ret;
    };

    ctrl.showDetails = function(bid, bool){
        if (bool){
            angular.forEach(bid.locations, function(value, key){
                var stopID = value.stopID;
                if (bid.adjustments && bid.adjustments[stopID]){
                    if (bid.adjustments[stopID].newTime){
                        value.earlyTime = bid.adjustments[stopID].newTime;
                        value.lateTime = bid.adjustments[stopID].newTime;
                    }
                    if (bid.adjustments[stopID].newDate){
                        value.earlyDate = bid.adjustments[stopID].newDate;
                        value.lateDate = bid.adjustments[stopID].newDate;
                    }
                }
            });
        }
        bid.showCounter = false;
        bid.showDetails = bool;
    };

    ctrl.handling = freightFilters.handling;

    ctrl.approveCounter = function(offer){
        console.log(offer);
        basicService.put('../../node/approve-bid', offer)
        .then(function success(response){
            console.log(response);
        }, function failure(response){
            if (response.error && (response.error == 'nodr')){
                console.log("NEED DRIVER");
            } else {
                console.log(response);
            }
        });
    };

    ctrl.toggleCounter = function(offer){
        if (offer.showCounter){
            offer.showCounter = false;
            offer.counterAmount = '';
        } else {
            offer.showCounter = true;
        }
    };

    ctrl.submitCounter = function(offer){
        var bidObj = {
            bid : {
                loadNumber: offer.loadNumber,
                money: offer.counterAmount,
                weight: offer.weight,
                handling: offer.handling,
                carrier: offer.carrier,
                driver: offer.driver,
                counterTo: offer.bidNumber,
                bidAgent: JSON.parse(sessionStorage.getItem('registeredUser')).uid,
                stops: []
            }
        };
        basicService.put('../../node/new-bid', bidObj.bid)
        .then(function success(response){
            console.log(response);
        }, function failure(response){
            console.log(response);
        });
    };

    ctrl.displayCounter = {
        show: false,
        amount: null,
        toggle: function(){
            this.show = !this.show;
        },
        submit: function(offer){
            console.log(offer);
        }
    };

    ctrl.displayCounterSubmit = function(offer){
        var counterObj = {};
        var uid = JSON.parse(sessionStorage.getItem('registeredUser') || '{}').uid;
        counterObj.money = offer.counterAmount || offer.amount;
        counterObj.loadNumber = offer.loadNumber;
        counterObj.weight = offer.weight;
        counterObj.handling = offer.handling;
        counterObj.carrier = uid;
        counterObj.driver = offer.driver;
        counterObj.stops = offer.adjustments;
        counterObj.bidAgent = uid;
        basicService.post('../node/submitBid', {bid: counterObj})
        .then(function success(response){
            console.log(response);
        }, function failure(response){
            console.log(response);
        });
    };

});
