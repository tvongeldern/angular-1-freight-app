app.get('/driver-can-get', function(request, response){

     var obj = {};
     var params = request.query || {};
     var driverSchedule = [];
     var stops = [];
     var compatible_loads = {
         before: [],
         after: []
     };
     var loadQuery = "SELECT stops.stopID, stops.lateTime AS `time`, stops.lateDate AS `date`, warehouses.zip AS `zip` FROM availableLoads LEFT JOIN stops ON stops.loadNumber=availableLoads.loadNumber INNER JOIN warehouses ON warehouses.whsNumber=stops.whsNum WHERE availableLoads.loadNumber=" + params.load + " ORDER BY stops.stopID";

    if (!params.driver || !params.load){
        response.send({error: 'params'});
    } else {

        fs.readFile('dist/queries/driverAvailabilitySchedule.sql', 'utf8', function(err, data){
            if (!err){
                scheduleQuery = data.replace(/{{[ ]{0,2}([a-zA-Z0-9\.\_\-]*)[ ]{0,2}}}/g, function(str, mch){ return params[mch]});
                defaultConnection.query(scheduleQuery, function(err, rows){
                    if (!err){
                        populate_driverSchedule(rows);
                        defaultConnection.query(loadQuery, function(errors, results){
                            if (!errors && results && results.length){
                                var stops_obj = populate_stops(results);
                                checkCompatibility(driverSchedule, stops_obj);
                            } else {
                                response.send({error: 'load'});
                            }
                        });
                    } else {
                        console.log('err:', err);
                        response.send({error: 'driver'});
                    }
                });
            } else {
                response.send({error: 'mysql', detail: err});
            }
        });

        function stopTimeInSeconds (stop){
            var date = stop.date.split('-');
            var time = stop.time.split(':');
            var year = parseInt(date[0]) - 1970;
            var month = parseInt(date[1]);
            var day = parseInt(date[2]);
            var hours = parseInt(time[0]);
            var min = parseInt(time[1]);
            return (60 * min) + (3600 * hours) + (86400 * (day - 1)) + (86400 * daysPassed(month, year)) + (86400 * 365 * year) - (86400 * Math.floor(year/4));
        };

        function daysPassed(month, year){
            var ret = 0;
            for (var i = 1; i < month; i++){
                ret += daysInMonth(i, year);
            }
            return ret;
        }

        function daysInMonth (month, year){
            var arr = [ 0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
            if (!year || month != 2) {
                return arr[month] || 'error';
            } else {
                return Number.isInteger(year/4) ? 29 : 28;
            }
        };

        function populate_driverSchedule(res) {
            var len = res.length;
            for (var i = 0; i < len; i++){
                var parsed = JSON.parse(res[i].load);
                var ret = {
                    loadNumber: parsed.loadNumber,
                    pickup: {
                        time: stopTimeInSeconds(parsed.pickup),
                        zip: parsed.pickup.zip
                    },
                    delivery: {
                        time: stopTimeInSeconds(parsed.delivery),
                        zip: parsed.delivery.zip
                    }
                };
                driverSchedule.push(ret);
            }
        };

        function populate_stops(res) {
            var len = res ? res.length : 0;
            var pick, del;
            if (!len) {
                response.send({error: 'load'});
            } else {
                for (var idx = 0; idx < len; idx++){
                    var date = new Date(res[idx].date);
                    var newDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
                    res[idx].date = newDate;
                    stops.push(res[idx]);
                }
                pick = stops[0];
                del = stops.reverse()[0];
                var stops_obj = {
                    pickup: {
                        time: stopTimeInSeconds(pick),
                        zip: pick.zip
                    },
                    delivery: {
                        time: stopTimeInSeconds(del),
                        zip: del.zip
                    }
                };
                return stops_obj;
            }
        };

        function checkCompatibility (sch, stp){
            var compatible = true;
            var ld_pick_time = stp.pickup.time;
            var ld_del_time = stp.delivery.time;
            var len = sch.length;
            if (!len) {
                approve_load();
            } else {
                for (var i = 0; i < len; i++){
                    var dr_pick_time = sch[i].pickup.time;
                    var dr_del_time = sch[i].delivery.time;
                    if (dr_pick_time > ld_del_time) {
                        compatible_loads.after.push(sch[i]);
                    } else if (dr_del_time < ld_pick_time) {
                        compatible_loads.before.push(sch[i]);
                    } else {
                        compatible = false;
                    }
                }
                if (compatible){
                    run_distance_checks();
                } else {
                    deny_load();
                }
            }
        };

        function approve_load(){
            response.send({can_get: true});
        };

        function deny_load(){
            response.send({can_get: false})
        };

        function run_distance_checks(){
            approve_load();
        }

    }



});
