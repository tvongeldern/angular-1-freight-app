SELECT concat('{', '\"loadNumber\":', pickup.loadNumber, ', \"pickup\":', pickup.info, ', \"delivery\":', delivery.info, '}') as `load`
FROM transitLoads
INNER JOIN (
	SELECT stops.loadNumber AS loadNumber,
	stops.stopID AS stopID,
	concat('{\"time\":\"', stops.lateTime, '\", \"date\":\"', stops.lateDate, '\", \"zip\":\"', warehouses.zip, '\"', '}') AS info
	FROM stops
	INNER JOIN warehouses ON stops.whsNum=warehouses.whsNumber
) AS pickup ON pickup.loadNumber=transitLoads.loadNumber
INNER JOIN (
	SELECT stops.loadNumber AS loadNumber,
	stops.stopID AS stopID,
	concat('{\"time\":\"', stops.lateTime, '\", \"date\":\"', stops.lateDate, '\", \"zip\":\"', warehouses.zip, '\"', '}') AS info
	FROM stops
	INNER JOIN warehouses ON stops.whsNum=warehouses.whsNumber
) AS delivery ON delivery.loadNumber=transitLoads.loadNumber
WHERE pickup.stopID=(SELECT MIN(stopID) FROM stops WHERE stops.loadNumber=pickup.loadNumber)
AND delivery.stopID=(SELECT MAX(stopID) FROM stops WHERE stops.loadNumber=delivery.loadNumber)
AND transitLoads.driver={{ driver }}
