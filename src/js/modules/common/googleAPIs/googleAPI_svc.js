app.service('googleAPI', function ($http, $q){

    var geocodeURI = "https://maps.googleapis.com/maps/api/geocode/json";
    var distanceURI = "http://maps.googleapis.com/maps/api/distancematrix/json";//?origins=60657&destinations=60614&mode=driving&sensor=false

    function reverseGeocode(lat, lon){
        var prom = $q.defer();
        var url = geocodeURI + '?latlng=' + lat + ',' + lon + '&sensor=true';
        $http.get(url)
        .success(function(response){
            prom.resolve(response);
        })
        .error(function(response){
            prom.reject(response);
        });
        return prom.promise;
    };

    function addressCheck (address1, city, state) {
        var prom = $q.defer();
        ad = address1.replace(" ", "+") + ',';
        city += ',';
        var url = geocodeURI + "?address=" + ad + city + state;
        $http.get(url)
        .success(function(response){
            var obj = response || {};
            var res = obj.results ? obj.results[0] || {} : {};
            if (!obj.results || obj.results.length == 0){
                prom.reject({error: 'no results'});
            } else if (obj.results && obj.results.length > 1){
                prom.reject({error: 'multiple results'});
            } else if (!obj.results){
                prom.reject({error: 'no results'});
            } else {
                var respObj = {};
                var len = res.address_components.length;
                var arr = res.address_components;
                var attrs = ['street_number', 'route', 'locality', 'administrative_area_level_1', 'postal_code'];
                var attrLen = attrs.length;
                function idxTo(arg, idx){
                    if (arr[idx].types.indexOf(arg) >= 0){
                        respObj[arg] = arr[idx].short_name;
                    };
                }
                for (var i = 0; i < len; i++){
                    for (var x = 0; x < attrLen; x++){
                        var atr = attrs[x];
                        idxTo(atr, i);
                    }
                }
                respObj.exactMatch = !res.partial_match;
                prom.resolve(respObj);
            }
        })
        .error(function(response){
            console.log(response);
            prom.reject({error: 'connection'});
        });
        return prom.promise;
    }

    return {
        reverseGeocode,
        addressCheck
    };

});
