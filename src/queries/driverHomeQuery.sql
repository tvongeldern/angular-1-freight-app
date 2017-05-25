SELECT transitLoads.loadNumber, transitLoads.loadStatus, transitLoads.weight,
transitLoads.handling, transitLoads.commodity, transitLoads.driver, users.firstName, users.lastName,
concat('[',
    group_concat('{','\"city\":\"', warehouses.city,'\",\"state\":\"', warehouses.state,'\",\"zip\":\"', warehouses.zip,
        '\",\"opsMgmt\":\"', warehouses.opsMgmt,'\",\"shipPhone\":\"', IFNULL(warehouses.shipPhone,warehouses.phone),
        '\",\"recPhone\":\"', IFNULL(warehouses.recPhone,warehouses.phone),'\",\"address\":\"', warehouses.address1,
        '\",\"address2\":\"', IFNULL(warehouses.address2,'null'),'\",\"whsName\":\"', warehouses.whsName,
        '\",\"genPhone\":\"', warehouses.phone,'\",\"earlyTime\":\"', stops.earlyTime,'\",\"lateTime\":\"', stops.lateTime,
        '\",\"earlyDate\":\"', stops.earlyDate,'\",\"lateDate\":\"', stops.lateDate,'\",\"action\":\"', stops.action,
        '\",\"stopID\":\"', stops.stopID,'\",\"status\":\"', stops.status, '\"}' ORDER BY stops.stopID
    ),
']') AS stops
FROM transitLoads
LEFT JOIN stops ON stops.loadNumber=transitLoads.loadNumber
INNER JOIN warehouses ON warehouses.whsNumber=stops.whsNum
INNER JOIN users ON userID={{ driver }}
WHERE transitLoads.driver={{ driver }}
AND transitLoads.loadStatus<4 AND transitLoads.loadStatus>0 GROUP BY transitLoads.loadNumber;
