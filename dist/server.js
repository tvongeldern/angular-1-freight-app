var express = require("express");
var bodyParser = require("body-parser");
var mysql = require('mysql');
var fs = require('fs');
var cp = require('child_process');
var http = require('http');

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname));

var defaultConnection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database: 'utpDatabase'
});

var multipleConnection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'utpDatabase',
    multipleStatements: true
});

function responseTypes(request, response) {
    return {
        post: {
            reg: function(er, rw, q){
                if (!er){
                    response.send(rw);
                } else {
                    console.log(er);
                    response.send({error: er, query: q});
                }
            }
        },
        get: {
            reg: function(er, rw, q){
                if (!er){
                    response.send(rw);
                } else {
                    console.log(er);
                    response.send({error: er, query: q});
                }
            }
        },
        put: {
            reg: function(er, rw, q){
                if (!er){
                    response.send(rw);
                } else {
                    console.log(er);
                    console.log(q);
                    response.send({error: er, query: q});
                }
            }
        },
        delete: {
            reg: function(er, rw){
                if (!er){
                    response.send({success: true});
                } else {
                    console.log(er);
                    console.log(q);
                    response.send({error: er, query: q});
                }
            }
        }
    };
};

function dbEndpoint(endpoint, method, settings, construct, customCallback){
    app[method](endpoint, function(request, response){
        var respObj = responseTypes(request, response),
            data = (method.charAt(0) == 'p' ? request.body : request.query);
        var connection = (settings == 'default') ? defaultConnection : settings;

        if (typeof construct == 'function'){
            var query = construct(data);
            connection.query(query, function(err, rows){
                if (!customCallback){
                    respObj[method].reg(err, rows, query);
                } else {
                    customCallback(request.body, response, err, rows);
                }
            });
        } else if (typeof construct == 'string'){
            var path = 'dist/queries/' + construct;
            var callback = function(arg){
                var query = arg.replace(/{{[ ]{0,2}([a-zA-Z0-9\.\_\-]*)[ ]{0,2}}}/g, function(str, mch){ return data[mch]});
                connection.query(query, function(err, rows){
                    if (!customCallback){
                        respObj[method].reg(err, rows, query);
                    } else {
                        customCallback(request.body, response, err, rows);
                    }
                });
            };
            fs.readFile(path, 'utf8', function(err, data){
                if (!err){
                    callback(data);
                } else {
                    callback(err);
                }
            });
        }
    });
};
dbEndpoint('/carrier-counteroffers', 'get', 'default', 'carrierCounteroffers.sql');

dbEndpoint('/delete-bid', 'delete', multipleConnection, function(data){
    var query = "START TRANSACTION;";
    query += "DELETE FROM bids WHERE bidNumber=" + data.bid;
    query += ";DELETE FROM stopAdjustments WHERE bidNumber=" + data.bid;
    query += ";COMMIT;";
    return query;
});

dbEndpoint('/new-bid', 'put', multipleConnection, function(data){
    var bid = data.bid;
    var query = "START TRANSACTION;" + "INSERT INTO bids (loadNumber,amount,weight,handling,carrier,driver,stopsAsIs,counterTo, bidAgent) ";
	query += "VALUES (" + bid.loadNumber + ',' + bid.money + ',' + (bid.weight || 'null') + ',' + (bid.handling || 'null') + ',' + bid.carrier + "," + bid.driver + ",";
	if (bid.stops.length > 0){
		query += "0," + (bid.counterTo || 'null') + "," + bid.bidAgent + "); ";
		query += "SET @newBidNum = LAST_INSERT_ID(); ";
	} else {
		query += "1," + (bid.counterTo || 'null') + "," + bid.bidAgent + "); ";
	}
	for (var i = 0; i < bid.stops.length; i++){
		if ((bid.stops[i].time) || (bid.stops[i].date)){
			var time = bid.stops[i].time ? "'" + bid.stops[i].newTime + "'" : 'null';
			var date = bid.stops[i].date ? "'" + bid.stops[i].newDate + "'" : 'null';
			query += "INSERT INTO stopAdjustments (bidNumber,stopNumber,newTime,newDate) ";
			query += "VALUES (@newBidNum," + bid.stops[i].stopID + "," + time + "," + date + ");";
		}
	};
	query += "COMMIT;"
    return query;
});

dbEndpoint('/approve-bid', 'post', multipleConnection, function(data){
    var query = "START TRANSACTION; INSERT INTO transitLoads (loadNumber, loadStatus, weight, handling, hazmat, unNumber, commodity, loadValue, customer, carrier, driver, rate)";
    query += " SELECT availableLoads.loadNumber, 1, " + (data.weight || 'availableLoads.weight');
    query += ", " + data.handling + ", availableLoads.hazmat, availableLoads.unNumber, availableLoads.commodity, availableLoads.loadValue, availableLoads.customer, bids.carrier, " + data.driver + ", bids.amount FROM bids";
    query += " INNER JOIN availableLoads ON availableLoads.loadNumber=" + data.loadNumber;
    query += " WHERE bids.bidNumber=" + data.bidNumber;
    query += "; DELETE FROM availableLoads WHERE loadNumber=" + data.loadNumber;
    query += "; INSERT INTO inactiveBids SELECT * FROM bids WHERE loadNumber=" + data.loadNumber;
    query += "; DELETE FROM bids WHERE loadNumber=" + data.loadNumber;
    if (data.stopsAsIs != 1){
        query += ";UPDATE stops INNER JOIN stopAdjustments ON stopAdjustments.stopNumber=stops.stopID SET stops.earlyTime = IF(stopAdjustments.newTime IS NOT NULL, stopAdjustments.newTime, stops.earlyTime), stops.lateTime = IF(stopAdjustments.newTime IS NOT NULL, stopAdjustments.newTime, stops.lateTime), stops.earlyDate = IF(stopAdjustments.newDate IS NOT NULL, stopAdjustments.newDate, stops.earlyDate), stops.lateDate = IF(stopAdjustments.newDate IS NOT NULL, stopAdjustments.newDate, stops.lateDate) ";
        query += "WHERE stopAdjustments.bidNumber=" + data.bidNumber;
    }
    return query + "; COMMIT;";
});
dbEndpoint('/carrier-dashboard-bids', 'get', defaultConnection, "carDshbrdBids.sql");

dbEndpoint('/carrier-dashboard-loads', 'get', defaultConnection, "carDshbrdLoads.sql");

dbEndpoint('/carrier-dashboard-drivers', 'get', defaultConnection, 'driverScheduleQueryBeta.sql');

dbEndpoint('/getCarrierDashboardDelivered', 'get', defaultConnection, function(data){
    var query = "SELECT * FROM deliveredLoads";
    return query;
});
dbEndpoint('/customer-available-loads', 'get', multipleConnection, 'custDshbrdAvailLoads.sql');

dbEndpoint('/customer-transit-loads', 'get', multipleConnection, "custDshbrdTransitLoads.sql");

dbEndpoint('/customer-tendered-loads', 'get', multipleConnection, "custDshbrdTenderedLoads.sql");
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
dbEndpoint('/driver-home-data', 'get', 'default', "driverHomeQuery.sql");

dbEndpoint('/driver-schedule', 'get', 'default', "driverAvailabilitySchedule.sql");
dbEndpoint('/validateCredentials', 'post', defaultConnection, function(data){
    return ("SELECT * from users WHERE username='" + data.un + "' AND passwrd='" + data.pw + "'");
}, function(data, response, err, rows){
    if (!err){
    	if (rows.length > 0){
    		var obj = {
    			userType: rows[0].userType,
    			userID: rows[0].userID,
    			success: true
    		};
    		response.send(obj);

    	} else {
    		response.send("creds");
    	}
    } else {
    	response.send(err);
    	console.log(err);
    }
});
dbEndpoint('/available-loads-board', 'get', multipleConnection, 'loadBoard.sql');

dbEndpoint('/load-details', 'get', defaultConnection, 'loadDetails.sql');

dbEndpoint('/new-load', 'put', multipleConnection, function(data){
    var freight = data.freight;
    var stops = data.stops;
    var query = "START TRANSACTION;";
    query += "INSERT INTO `availableLoads` (`loadStatus`, `commodity`, `handling`, `hazmat`, `unNumber`, `weight`, `customer`) ";
    query += "VALUES (" + 0 + ',"' + freight.commodity + '",' + freight.handling + ',' + freight.hazmat + ',' + (freight.unNumber ? '"' + freight.unNumber + '"' : null) + ',' + freight.weight + ',' + freight.customer + ');';
    query += "SET @loadNumAlias=LAST_INSERT_ID();";
    query += "SELECT LAST_INSERT_ID() AS insertID;";
    for (var i = 0; i < stops.length; i++){
        query += "INSERT INTO `stops` (`loadNumber`, `action`, `whsNum`, `status`, `earlyTime`, `earlyDate`, `lateTime`, `lateDate`) ";
        query += "VALUES (@loadNumAlias," + stops[i].action + ',' + stops[i].whsNumber + ',1,"' + stops[i].readyTime + '","' + stops[i].readyDate + '","' + stops[i].deadlineTime + '","' + stops[i].deadlineDate + "\");";
    }
    query += 'COMMIT;';
    return query
});

dbEndpoint('/delete-load', 'delete', defaultConnection, 'deleteLoad.sql');
dbEndpoint('/check-in', 'put', multipleConnection, function(data){
    var query = 'START TRANSACTION; ';
    query += 'UPDATE transitLoads SET loadStatus=2 WHERE loadNumber=' + data.load + "; ";
    query += "UPDATE stops SET `status`=2  WHERE loadNumber=" + data.load + " ORDER BY stopID LIMIT 1; ";
    query += "COMMIT;";
    return query;
});

dbEndpoint('/stop-status', 'put', defaultConnection, function(data){
    return "UPDATE stops SET status=" + data.status + " WHERE stopID=" + data.stop;
});

dbEndpoint('/finish-stop', 'put', multipleConnection, function(data){
    return "START TRANSACTION;UPDATE stops SET `status`=5 WHERE stopID=" + data.stop + "; UPDATE stops SET `status`=2 WHERE stopID>" + data.stop + " AND loadNumber=" + data.load + " LIMIT 1; COMMIT;";
});

dbEndpoint('/deliveries', 'put', multipleConnection, function(data){
    var query = "START TRANSACTION; INSERT INTO deliveredLoads (loadNumber, loadStatus, weight, handling, hazmat, unNumber, commodity, loadValue, customer, carrier, driver, rate) SELECT loadNumber, 3, weight, handling, hazmat, unNumber, commodity, loadValue, customer, carrier, driver, rate FROM transitLoads ";
    query += "WHERE loadNumber=" + data.load + "; DELETE FROM transitLoads WHERE loadNumber=" + data.load + "; INSERT INTO deliveredLoadStops (stopID, loadNumber, action, whsNum, status, earlyTime, earlyDate, lateTime, lateDate) SELECT stopID, loadNumber, action, whsNum, status, earlyTime, earlyDate, lateTime, lateDate FROM stops ";
    query += "WHERE loadNumber=" + data.load + "; DELETE FROM stops WHERE loadNumber=" + data.load + "; COMMIT;";
    return query;
});

dbEndpoint('/location-updates', 'put', defaultConnection, function(data){
    return "INSERT INTO locationUpdates (driverID, loadNumber, lat, lon, time, date) VALUES ('" + data.driver + "'," + data.load + ",'" + data.lat + "','" + data.lon + "','" + data.time + "','" + data.date + "')";
});
dbEndpoint('/new-warehouse', 'put', multipleConnection, function(data){
    var query = "START TRANSACTION;";
	query += "INSERT INTO warehouses (whsName, address1, address2, city, state, zip, phone, email, transpoMgr, genOpen, genClose, genApt, lumper, opsMgmt, shipPhone, shipEmail, shipMgr, shipOpen, shipClose, shipApt, recPhone, recEmail, recMgr, recOpen, recClose, recApt) ";
	query += "VALUES (" + "'" + data.whsName + "','" + data.address1 + "','" + data.address2 + "','" + data.city + "','" + data.state + "','" + data.zip + "','" + data.phone + "','" + data.email + "','" + data.transpoMgr + "','" + data.genOpen + "','" + data.genClose + "','" + data.genApt + "','" + data.lumper + "','" + data.opsMgmt + "','" + data.shipPhone + "','" + data.shipEmail + "','" + data.shipMgr + "','" + data.shipOpen + "','" + data.shipClose + "','" + data.shipApt + "','" + data.recPhone + "','" + data.recEmail + "','" + data.recMgr + "','" + data.recOpen + "','" + data.recClose + "','" + data.recApt + "');";
	query += "SELECT LAST_INSERT_ID() AS insertID;"
	query += "COMMIT;";
    return query;
});

dbEndpoint('/warehouse-matches', 'get', defaultConnection, function(data){
    var query = "SELECT whsNumber, whsName, address1, address2, city, state, zip FROM warehouses WHERE ";
    if (!!data.whsNumber){
    	query += "whsNumber LIKE '%" + data.whsNumber + "%' AND ";
    }
    if (!!data.whsName){
    	query += "whsName LIKE '%" + data.whsName + "%' AND ";
    }
    if (!!data.address){
    	query += "address1 LIKE '%" + data.address + "%' AND ";
    }
    if (!!data.address2){
    	query += "address2 LIKE '%" + data.address2 + "%' AND ";
    }
    if (!!data.city){
    	query += "city LIKE '%" + data.city + "%' AND ";
    }
    if (!!data.state){
    	query += "state LIKE '%" + data.state + "%' AND ";
    }
    if (!!data.zip){
    	query += "zip LIKE '%" + data.zip + "%' AND ";
    }
    return query.substring(0, query.length - 4);
});
app.listen(8080,function(){
	console.log("Started on PORT 8080");
});