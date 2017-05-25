SELECT users.firstName, users.lastName, users.userID as driverID,
history.schedge, transit.transitLoad, lastUpdate.upData
FROM users
LEFT JOIN
	(
		SELECT transitLoads.driver AS driver,
		concat('[',
			group_concat('{', '\"loadNumber\":', transitLoads.loadNumber, ', \"stops\": [', stopDetails.allStops,
			']}'),
		']') AS schedge
		FROM transitLoads
		LEFT JOIN
			(
				SELECT stops.loadNumber AS loadNumber,
				group_concat(
					'{','\"stopID\":',stops.stopID, ', \"zip\":',warehouses.zip,',\"earlyTime\":\"',stops.earlyTime,'\", \"lateTime\":\"',stops.lateTime,'\", \"earlyDate\":\"',stops.earlyDate,'\", \"lateDate\":\"',stops.lateDate,'\"}'
				) AS allStops
				FROM stops
				INNER JOIN warehouses ON warehouses.whsNumber=stops.whsNum
				GROUP BY stops.loadNumber
			)
		AS stopDetails ON stopDetails.loadNumber=transitLoads.loadNumber
		GROUP BY transitLoads.driver
	)
AS history ON history.driver=users.userID
LEFT JOIN
	(
		SELECT driver,
		concat(
			'{','\"loadNumber\":', transitLoads.loadNumber,',\"status\":', transitLoads.loadStatus, ',\"stops\":', '[',
			group_concat('{','\"stopID\":', stops.stopID,',\"zip\":\"',warehouses.zip,'\"}'),
			']','}') AS transitLoad
		FROM transitLoads
		LEFT JOIN stops ON stops.loadNumber=transitLoads.loadNumber
		LEFT JOIN warehouses ON warehouses.whsNumber=stops.whsNum
		WHERE transitLoads.loadStatus=2
		GROUP BY transitLoads.loadNumber
	)
AS transit ON transit.driver=users.userID
LEFT JOIN
	(
		SELECT driverID AS drID,
		concat('{','\"id\":', updateID,',\"loadNumber\":', IFNULL(loadNumber, 0),',\"lat\":', lat,',\"lon\":', lon,',\"time\":\"', `time`,'\",\"date\":\"', `date`,'\"}') AS upData
		FROM locationUpdates
		ORDER BY updateID DESC
		LIMIT 1
	)
AS lastUpdate ON lastUpdate.drID=users.userID
INNER JOIN drivers ON drivers.driverID=users.userID
WHERE drivers.carrier={{ user }}
GROUP BY users.firstName, users.lastName, driverID, history.schedge, transit.transitLoad, lastUpdate.upData
