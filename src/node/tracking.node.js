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
