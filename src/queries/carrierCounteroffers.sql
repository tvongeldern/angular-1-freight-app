SELECT bids.*, availableLoads.handling AS originalHandling, availableLoads.weight AS originalWeight,
concat('[',
    group_concat('{\"city\":\"',warehouses.city,'\",\"state\":\"',warehouses.state,'\",\"zip\":\"',warehouses.zip,
        '\",\"earlyTime\":\"',stops.earlyTime,'\",\"earlyDate\":\"',stops.earlyDate,'\",\"lateTime\":\"',
        stops.lateTime,'\",\"lateDate\":\"',stops.lateDate,'\",\"stopID\":\"',stops.stopID,'\"}' ORDER BY stops.stopID),
']') AS locations,
concat('{',
    group_concat(DISTINCT '\"',stopAdjustments.stopNumber,'\":{\"adjustmentNumber\":\"',stopAdjustments.adjustmentNumber,
        '\",\"bidNumber\":\"',stopAdjustments.bidNumber,'\",\"stopNumber\":\"',stopAdjustments.stopNumber,
        '\",\"newTime\":\"',IFNULL(stopAdjustments.newTime, ''),'\",\"newDate\":\"',IFNULL(stopAdjustments.newDate, ''),'\"}'
        ORDER BY stopAdjustments.stopNumber),
'}') AS adjustments
FROM bids
LEFT JOIN stops ON bids.loadNumber=stops.loadNumber
LEFT JOIN availableLoads ON bids.loadNumber=availableLoads.loadNumber
LEFT JOIN warehouses ON stops.whsNum=warehouses.whsNumber
LEFT JOIN stopAdjustments ON stopAdjustments.bidNumber=bids.bidNumber
WHERE bids.carrier={{ uid }} AND bids.bidAgent!={{ uid }} GROUP BY bids.bidNumber
