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
