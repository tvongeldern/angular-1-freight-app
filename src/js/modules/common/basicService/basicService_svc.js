app.service('basicService', function($http, $q){

    function post(endpoint, data, success, failure){
        var prom = $q.defer();
        $http.post(endpoint, data)
        .success(function(response){
            if (!response.error){
                if (success && typeof success == 'function'){
                    success(prom, response);
                } else {
                    if (response[0] && response[0].serverStatus){
        				response.shift();
                        prom.resolve(response[0]);
        			} else {
                        prom.resolve(response);
                    }
                }
            } else {
                if (failure && typeof failure == 'function'){
                    failure(prom, response);
                } else {
                    prom.reject(response);
                }
            }
        })
        .error(function(response){
            if (failure && typeof failure == 'function'){
                failure(prom, response);
            } else {
                prom.reject(response);
            }
        });
        return prom.promise;
    };

    function get(endpoint, success, failure){
        var prom = $q.defer();
        $http.get(endpoint)
        .success(function(response){
            if (!response.error){
                if (success && typeof success == 'function'){
                    success(prom, response);
                } else {
                    if (response[0] && response[0].serverStatus){
        				response.shift();
                        prom.resolve(response[0]);
        			} else {
                        prom.resolve(response);
                    }
                }
            } else {
                if (failure && typeof failure == 'function'){
                    failure(prom, response);
                } else {
                    prom.reject(response);
                }
            }
        })
        .error(function (response){
            if (failure && typeof failure == 'function'){
                failure(prom, response);
            } else {
                prom.reject(response);
            }
        });
        return prom.promise;
    };

    function put(endpoint, data){
        var prom = $q.defer();
        $http.put(endpoint, data)
        .success(function(response){
            if (!response.error){
                var ret = {success: true};
                angular.forEach(response, function(v, k){
                    if (!v.affectedRows && v.affectedRows != 0 && v[0] && v[0].insertID){
                        ret.insertID = v[0].insertID;
                    }
                });
                prom.resolve(ret);
            } else {
                prom.reject(response);
            }
        })
        .error(function(response){
            prom.reject(response);
            console.log('error',response);
        });
        return prom.promise;
    };

    function del(endpoint, success, failure){
        var prom = $q.defer();
        $http.delete(endpoint)
        .success(function(response){
            if (!response.error){
                if (success && typeof success == 'function'){
                    success(prom, response);
                } else {
                    if (response[0] && response[0].serverStatus){
        				response.shift();
                        prom.resolve(response[0]);
        			} else {
                        prom.resolve(response);
                    }
                }
            } else {
                if (failure && typeof failure == 'function'){
                    failure(prom, response);
                } else {
                    prom.reject(response);
                }
            }
        })
        .error(function (response){
            if (failure && typeof failure == 'function'){
                failure(prom, response);
            } else {
                prom.reject(response);
            }
        });
        return prom.promise;
    };

    return {
        post,
        get,
        put,
        del
    }

});
