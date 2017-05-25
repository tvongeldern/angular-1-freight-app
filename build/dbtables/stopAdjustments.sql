CREATE TABLE `stopAdjustments` (
  `adjustmentNumber` int(11) NOT NULL AUTO_INCREMENT,
  `bidNumber` bigint(20) DEFAULT NULL,
  `stopNumber` int(11) DEFAULT NULL,
  `newTime` time DEFAULT NULL,
  `newDate` date DEFAULT NULL,
  PRIMARY KEY (`adjustmentNumber`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
