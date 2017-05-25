SET SESSION group_concat_max_len = 10000;
SELECT availableLoads.*,
concat('[',
    group_concat(
        DISTINCT '{','\"stopID\":',stops.stopID,',\"action\":',stops.action,',\"status\":',stops.status,',\"earlyTime\":\"',
        stops.earlyTime,'\",\"earlyDate\":\"',stops.earlyDate,'\",\"lateTime\":\"',stops.lateTime,'\",\"lateDate\":\"',
        stops.lateDate,'\",\"whsNumber\":',warehouses.whsNumber,',\"city\":\"',warehouses.city,'\",\"state\":\"',
        warehouses.state,'\",\"zip\":\"',warehouses.zip,'\"}'
        ORDER BY stops.stopID
    ),
']') AS stops
FROM availableLoads
LEFT JOIN stops ON availableLoads.loadNumber = stops.loadNumber
LEFT JOIN warehouses ON warehouses.whsNumber = stops.whsNum
WHERE availableLoads.loadStatus=0
GROUP BY availableLoads.loadNumber
