SET SESSION group_concat_max_len = 10000;
SELECT transitLoads.loadNumber, transitLoads.driver, users.firstName, users.lastName,
concat('[',
    group_concat(DISTINCT '{','\"stopID\":',stops.stopID,',\"action\":',stops.action,',\"status\":',stops.status,
        ',\"earlyTime\":\"',stops.earlyTime,'\",\"earlyDate\":\"',stops.earlyDate,'\",\"lateTime\":\"',stops.lateTime,
        '\",\"lateDate\":\"',stops.lateDate,'\",\"whsNumber\":',warehouses.whsNumber,',\"whsName\":\"',warehouses.whsName,
        '\",\"city\":\"',warehouses.city,'\",\"state\":\"',warehouses.state,'\",\"zip\":\"',warehouses.zip,'\"}'
    ),
']') AS stops,
concat('{',
    '\"time\":\"',location.time,'\",\"date\":\"',location.date,'\",\"lat\":',location.lat,',\"lon\":',location.lon,
'}') AS lastUpdate
FROM transitLoads
LEFT JOIN stops ON transitLoads.loadNumber = stops.loadNumber
LEFT JOIN warehouses ON warehouses.whsNumber = stops.whsNum
LEFT JOIN users ON users.userID = transitLoads.driver
LEFT JOIN
(
    SELECT * FROM locationUpdates
    ORDER BY updateID
    DESC LIMIT 1
) AS location ON location.driverID = transitLoads.driver
WHERE loadStatus=2
AND transitLoads.customer={{ customer }}
GROUP BY transitLoads.loadNumber, location.updateID;
