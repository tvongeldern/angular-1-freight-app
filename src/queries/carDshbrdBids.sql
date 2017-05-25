SELECT bids.*, availableLoads.commodity, availableLoads.unNumber,
concat('{\"weight\":',availableLoads.weight,',\"handling\":',availableLoads.handling,'}') AS original,
concat('{',
    group_concat(
        DISTINCT '\"',stopAdjustments.stopNumber,'\":{\"adjustmentNumber\":\"',stopAdjustments.adjustmentNumber,
        '\",\"bidNumber\":\"',stopAdjustments.bidNumber,'\",\"stopNumber\":\"',stopAdjustments.stopNumber,'\",\"newTime\":\"',
        IFNULL(stopAdjustments.newTime, ''),'\",\"newDate\":\"',IFNULL(stopAdjustments.newDate, ''),'\"}'
        ORDER BY stopAdjustments.stopNumber
    ),
'}') AS adjustments,
concat('[',
    group_concat(
        DISTINCT '{\"city\":\"',warehouses.city,'\",\"state\":\"',warehouses.state,'\",\"zip\":\"',
        warehouses.zip,'\",\"earlyTime\":\"',stops.earlyTime,'\",\"earlyDate\":\"',stops.earlyDate,'\",\"lateTime\":\"',
        stops.lateTime,'\",\"lateDate\":\"',stops.lateDate,'\",\"action\":\"',stops.action,'\",\"stopID\":\"',stops.stopID,'\"}'
        ORDER BY stops.stopID
    ),
']') AS locations
FROM bids
LEFT JOIN stopAdjustments ON bids.bidNumber=stopAdjustments.bidNumber
INNER JOIN availableLoads ON bids.loadNumber=availableLoads.loadNumber
LEFT JOIN stops ON stops.loadNumber=availableLoads.loadNumber
INNER JOIN warehouses ON warehouses.whsNumber=stops.whsNum
WHERE bids.carrier={{ user }}
GROUP BY bids.bidNumber ORDER BY availableLoads.loadNumber
