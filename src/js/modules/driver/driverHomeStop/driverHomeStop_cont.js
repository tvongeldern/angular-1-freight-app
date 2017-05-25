app.controller('driverHomeStopController', function($scope, basicService){

    $scope.buttonText = '';

    $scope.collapsed = {
        button: function(){
            return !$scope.info.open ? '+' : '--';
        },
        toggle: function(){
            $scope.info.open = !$scope.info.open;
        }
    };

    $scope.phoneFormat = function(number){
        var num = String(number);
        var str = "(";
        str += num.slice(0,3);
        str += ") ";
        str += num.slice(3,6);
        str += " - ";
        str += num.slice(6,10);
        return str;
    };

    $scope.progress = function(){
        var stat = parseInt($scope.info.status);
        if (stat == 1){
            checkIn();
            $scope.refresh();
        } else if (stat == 4){
            finish();
        } else {
            setStopStatus(stat + 1);
        }
    }

    function checkIn(){
        basicService.put('../../node/check-in', {load: $scope.load})
        .then(function success(response){
            $scope.info.status = 2;
            setButtonText();
        }, function failure(response){
            console.log(response);
        });
    };

    function setStopStatus(int){
        basicService.put('../../node/stop-status', { stop: $scope.info.stopID, status: int })
        .then(function success(response){
            $scope.info.status = int;
            setButtonText();
        }, function failure(response){
            console.log(response);
        });
    };

    function finish(){
        basicService.put('../node/finish-stop', { stop: $scope.info.stopID, load: $scope.load })
        .then(function success(response){
            $scope.info.status = 4;
            $scope.collapsed.state = true;
            $scope.refresh(true);
        }, function failure(response){
            console.log(response);
        });
    };

    function setButtonText (){
        var stat = $scope.info.status;
        if (stat == 1){
            $scope.buttonText = "En Route";
        } else if (stat == 2){
            $scope.buttonText = "Arrived";
        } else if (stat == 3){
            $scope.buttonText = "Truck Being Worked";
        } else if (stat == 4){
            $scope.buttonText = "Finished";
        } else if (stat == 5){
            $scope.buttonText = "Rejected";
        }
    };

    setButtonText();

});
