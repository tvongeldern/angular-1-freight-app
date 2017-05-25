app.controller('driverHomeController', function($scope, $filter, loadStatusSvc, basicService){

    const drID = JSON.parse(sessionStorage.getItem('registeredUser')).uid;

    var getPosition = {
        success: function(res){
            console.log(res);
            $scope.buttonText = "Update Location";
            $scope.buttonClass = "location-update-button";
        },
        failure: function(){
            console.log("FAILURE");
        },
        notPresent: function(){
            console.log("Not Present");
        },
        sendDataToServer: function(position){
            var present = new Date();
            var updateObj = {
                driver: drID,
                load: $scope.load.loadNumber || null,
                date: $filter('date')(present, 'yyyy-MM-dd'),
                time: $filter('date')(present, 'HH:mm:ss'),
                lat: position.coords.latitude,
                lon: position.coords.longitude
            };
            basicService.put('../node/location-updates', updateObj)
            .then(function success(response){
                    getPosition.success(response);
                }, function failure(response){
                    getPosition.connectionError(response)
                });
        },
        connectionError: function(res){
            console.log(res);
        }
    };

    function refresh(){
        var len = $scope.load.stops.length;
        var counter = 0;
        for (var i = 0; i < len; i++){
            if ($scope.load.stops[i].status == 5){
                counter += 1;
            } else {
                break;
            }
        }
        if (counter && counter == len){
            console.log("DELIVER");
            deliverLoad();
        }
    };

    function selectOpen(arr){
        var length = arr.length;
        var counter = 0;
        for (var n = 0; n < length; n++){
            if (arr[n].status == 1 && !!arr[(n-1)]){
                arr[(n-1)].open = true;
                if (arr[(n-2)]){
                    arr[(n-2)].open = false;
                }
                break;
            } else {
                counter += 1;
            }
        }
        if (counter == length){
            arr[(length - 1)].open = true;
            arr[(length - 2)].open = false;
        } else if (counter == 0) {
            arr[0].open = true;
        }
    };

    function selectLoad(rows){
        selectDriver(rows[0]);
        return rows[0];
    };

    function selectDriver(load){
        if (load && load.driver) {
            $scope.driver = {
                ID: load.driver,
                firstName: load.firstName,
                lastName: load.lastName
            };
        }
    };

    function deliverLoad(){
        basicService.put('../node/deliveries', {load: $scope.load.loadNumber})
        .then(function success(response){
            $scope.getDriverData();
        }, function failure(response){
            console.log(response);
        });
    };

    $scope.driver = {};
    $scope.load = {};

    $scope.buttonText = "Update Location";
    $scope.buttonClass = "location-update-button";

    $scope.getDriverData = function(){
        basicService.get('../node/driver-home-data/?driver=' + drID)
        .then(function success(response){
            var len = response.length;
            for (var i = 0; i < len; i++){
                response[i].stops = JSON.parse(response[i].stops);
                selectOpen(response[i].stops);
            }
            $scope.load = selectLoad(response);
            refresh();
        }, function failure(response){
            console.log({error: true, response: response});
        });
    };

    $scope.locationProvide = function(){
        if (navigator.geolocation){
            $scope.buttonText = "Updating";
            $scope.buttonClass += " button-loading";
            navigator.geolocation.getCurrentPosition(getPosition.sendDataToServer, getPosition.failure);
        } else {
            getPosition.notPresent();
        }
    };

    $scope.getDriverData();

});
