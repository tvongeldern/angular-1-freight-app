CREATE TABLE `locationUpdates` (
  `updateID` int(11) NOT NULL AUTO_INCREMENT,
  `driverID` int(11) DEFAULT NULL,
  `loadNumber` int(11) DEFAULT NULL,
  `lat` decimal(11,9) DEFAULT NULL,
  `lon` decimal(11,9) DEFAULT NULL,
  `time` time DEFAULT NULL,
  `date` date DEFAULT NULL,
  PRIMARY KEY (`updateID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
