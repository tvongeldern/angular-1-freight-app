CREATE TABLE `bids` (
  `bidNumber` bigint(20) NOT NULL AUTO_INCREMENT,
  `loadNumber` int(11) DEFAULT NULL,
  `amount` int(6) DEFAULT NULL,
  `weight` int(5) DEFAULT NULL,
  `handling` int(2) DEFAULT NULL,
  `carrier` int(11) DEFAULT NULL,
  `stopsAsIs` tinyint(1) DEFAULT NULL,
  `driver` int(11) DEFAULT NULL,
  `counterTo` bigint(20) DEFAULT NULL,
  `bidAgent` int(11) DEFAULT NULL,
  PRIMARY KEY (`bidNumber`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
