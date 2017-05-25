app.service('loadStatusSvc', function($http, $q){

    var stop = {
        set: function(stopID, status){
            var prom = $q.defer();
            var data = {
                stop: stopID,
                status: status
            };
            var url = "../node/setStopStatus";
            $http.post(url, data)
            .success(function(response){
                prom.resolve(response);
            })
            .error(function(response){
                prom.reject(response);
            });
            return prom.promise;
        },
        finish: function(stopID, loadNumber){
            var prom = $q.defer();
            var data = {
                stop: stopID,
                load: loadNumber
            };
            var url = "../node/finishStop";
            $http.post(url, data)
            .success(function(response){
                prom.resolve(response);
            })
            .error(function(response){
                prom.reject(response);
            });
            return prom.promise;
        }
    }

    var load = {
        bounce: function(loadNumber){
            console.log("Bounce " + loadNumber);
        },
        checkIn: function(loadNumber){
            var prom = $q.defer();
            var data = {
                load: loadNumber
            };
            var url = "../node/checkInToLoad";
            $http.post(url, data)
            .success(function(response){
                prom.resolve(response);
            })
            .error(function(response){
                prom.reject(response);
            });
            return prom.promise;
        },
        deliver: function(loadNumber){
            var prom = $q.defer();
            var data = {
                load: loadNumber
            };
            var url = "../node/deliverLoad";
            $http.post(url, data)
            .success(function(response){
                prom.resolve(response);
            })
            .error(function(response){
                prom.reject(response);
            });
            return prom.promise;
        }
    }

    return {
        stop,
        load
    }

});
