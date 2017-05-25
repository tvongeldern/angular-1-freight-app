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
