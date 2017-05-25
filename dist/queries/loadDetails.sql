SELECT availableLoads.loadNumber, availableLoads.loadStatus, availableLoads.weight, availableLoads.handling,
availableLoads.hazmat, availableLoads.unNumber, availableLoads.commodity,
concat('[',
    group_concat(
        '{','\"stopID\":',stops.stopID,',\"action\":',stops.action,',\"earlyTime\":\"',stops.earlyTime,'\",\"earlyDate\":\"',
        stops.earlyDate,'\",\"lateTime\":\"',stops.lateTime,'\",\"lateDate\":\"',stops.lateDate,'\",\"city\":\"',
        warehouses.city,'\",\"state\":\"',warehouses.state,'\",\"zip\":\"',warehouses.zip,'\"','}'
    ),
']') as stops
FROM availableLoads
LEFT JOIN stops ON stops.loadNumber=availableLoads.loadNumber
INNER JOIN warehouses ON warehouses.whsNumber=stops.whsNum
WHERE availableLoads.loadNumber={{ load }}
