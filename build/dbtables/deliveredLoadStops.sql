CREATE TABLE `deliveredLoadStops` (
  `stopID` int(11) NOT NULL,
  `loadNumber` int(11) DEFAULT NULL,
  `action` int(1) DEFAULT NULL,
  `whsNum` int(11) DEFAULT NULL,
  `status` int(1) DEFAULT NULL,
  `earlyTime` time DEFAULT NULL,
  `earlyDate` date DEFAULT NULL,
  `lateTime` time DEFAULT NULL,
  `lateDate` date DEFAULT NULL,
  PRIMARY KEY (`stopID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
