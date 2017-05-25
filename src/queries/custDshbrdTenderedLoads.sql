SET SESSION group_concat_max_len = 10000;
SELECT transitLoads.loadNumber, transitLoads.driver, users.firstName, users.lastName,
concat('[',
    group_concat(DISTINCT '{',
        '\"stopID\":',stops.stopID,',\"action\":',stops.action,',\"status\":',stops.status,',\"earlyTime\":\"',stops.earlyTime,
        '\",\"earlyDate\":\"',stops.earlyDate,'\",\"lateTime\":\"',stops.lateTime,'\",\"lateDate\":\"',stops.lateDate,
        '\",\"whsNumber\":',warehouses.whsNumber,',\"whsName\":\"',warehouses.whsName,'\",\"city\":\"',warehouses.city,
        '\",\"state\":\"',warehouses.state,'\",\"zip\":\"',warehouses.zip,
    '\"}'),
']') AS stops,
location.lastUpdate FROM transitLoads
LEFT JOIN stops ON transitLoads.loadNumber = stops.loadNumber
LEFT JOIN warehouses ON warehouses.whsNumber = stops.whsNum
LEFT JOIN users ON users.userID = transitLoads.driver
LEFT JOIN
(
    SELECT driverID,
    concat(
        '{','\"lat\":',lat,',\"lon\":',lon,',\"time\":\"',`time`,'\",\"date\":\"',`date`,'\"}'
    ) AS lastUpdate
    FROM locationUpdates
    ORDER BY updateID DESC
    LIMIT 1
) AS location ON location.driverID = transitLoads.driver
WHERE loadStatus=1 AND transitLoads.customer={{ customer }}
GROUP BY transitLoads.loadNumber, location.lastUpdate;
