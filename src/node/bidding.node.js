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
