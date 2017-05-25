SET SESSION group_concat_max_len = 10000;
SELECT availableLoads.*,
concat('[',
    group_concat(DISTINCT '{','\"stopID\":',stops.stopID,',\"action\":',stops.action,',\"status\":',stops.status,
        ',\"earlyTime\":\"',stops.earlyTime,'\",\"earlyDate\":\"',stops.earlyDate,'\",\"lateTime\":\"',stops.lateTime,
        '\",\"lateDate\":\"',stops.lateDate,'\",\"whsNumber\":',warehouses.whsNumber,',\"whsName\":\"',warehouses.whsName,
        '\",\"city\":\"',warehouses.city,'\",\"state\":\"',warehouses.state,'\",\"zip\":\"',warehouses.zip,'\"}'),
']') AS stops,
bidsObj.bidInfo AS allBids
FROM availableLoads
LEFT JOIN stops ON availableLoads.loadNumber = stops.loadNumber
INNER JOIN warehouses ON warehouses.whsNumber = stops.whsNum
LEFT JOIN
(
    SELECT bids.loadNumber,
    concat('[',
        group_concat(DISTINCT '{','\"amount\":',bids.amount,',\"bidNumber\":\"',bids.bidNumber,
            '\",\"weight\":', IFNULL(bids.weight, 'null'),',\"handling\":', IFNULL(bids.handling, 'null'),
            ',\"loadNumber\":',bids.loadNumber,',\"counterTo\":', IFNULL(bids.counterTo, 'null'),
            ',\"stopsAsIs\":', bids.stopsAsIs,',\"adjustments\":',IFNULL(adjustments.allAdj, 0),
            ',\"carrier\":',bids.carrier,',\"bidAgent\":',bids.bidAgent,',\"driver\":', IFNULL(bids.driver, 'null'), '}'),
    ']') AS bidInfo
    FROM bids
    LEFT JOIN
    (
        SELECT stopAdjustments.bidNumber AS bidNumber,
        concat('[',
        group_concat('{','\"stopNumber\":',stopAdjustments.stopNumber,',\"adjustmentNumber\":',stopAdjustments.adjustmentNumber,
            ',\"newTime\":\"',IFNULL(stopAdjustments.newTime, 0),'\",\"newDate\":\"',IFNULL(stopAdjustments.newDate, 0),'\"','}'),
        ']') AS allAdj
        FROM stopAdjustments
        GROUP BY bidNumber
    ) AS adjustments ON adjustments.bidNumber=bids.bidNumber
    GROUP BY bids.loadNumber
) AS bidsObj ON bidsObj.loadNumber = availableLoads.loadNumber
WHERE availableLoads.customer={{ customer }}
GROUP BY availableLoads.loadNumber, bidsObj.bidInfo;
