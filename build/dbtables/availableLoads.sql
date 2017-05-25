CREATE TABLE `availableLoads` (
  `loadNumber` int(11) NOT NULL AUTO_INCREMENT,
  `loadStatus` tinyint(1) DEFAULT NULL,
  `weight` int(11) DEFAULT NULL,
  `handling` tinyint(1) DEFAULT NULL,
  `hazmat` tinyint(1) DEFAULT NULL,
  `unNumber` varchar(10) DEFAULT NULL,
  `commodity` varchar(100) DEFAULT NULL,
  `loadValue` int(11) DEFAULT NULL,
  `customer` int(11) DEFAULT NULL,
  PRIMARY KEY (`loadNumber`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
