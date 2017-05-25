SELECT transitLoads.loadNumber, transitLoads.loadStatus, transitLoads.driver,
users.firstName AS driverFirstName, users.lastName AS driverLastName,
concat('[',
    group_concat(
        DISTINCT '{','\"stopID\":',stops.stopID,',\"status\":',stops.status,',\"city\":\"',
        warehouses.city,'\",\"state\":\"',warehouses.state,'\",\"zip\":\"',warehouses.zip,'\"}'
        ORDER BY stops.stopID
    ),
']') AS stops,
lastUpdate.time AS lastUpdateTime, lastUpdate.date AS lastUpdateDate, lastUpdate.lat AS lastUpdateLat, lastUpdate.lon AS lastUpdateLon
FROM transitLoads
LEFT JOIN stops ON stops.loadNumber=transitLoads.loadNumber
LEFT JOIN
(
    SELECT * FROM locationUpdates
    ORDER BY updateID DESC LIMIT 1
) AS lastUpdate ON lastUpdate.driverID=transitLoads.driver
INNER JOIN users ON users.userID=transitLoads.driver
INNER JOIN warehouses ON warehouses.whsNumber=stops.whsNum
WHERE transitLoads.carrier={{ user }}
GROUP BY transitLoads.loadNumber, lastUpdate.time, lastUpdate.date, lastUpdate.lat, lastUpdate.lon
