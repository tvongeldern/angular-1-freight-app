CREATE TABLE `transitLoads` (
  `loadNumber` int(11) NOT NULL,
  `loadStatus` tinyint(1) DEFAULT NULL,
  `weight` int(11) DEFAULT NULL,
  `handling` tinyint(1) DEFAULT NULL,
  `hazmat` tinyint(1) DEFAULT NULL,
  `unNumber` varchar(10) DEFAULT NULL,
  `commodity` varchar(100) DEFAULT NULL,
  `loadValue` int(11) DEFAULT NULL,
  `customer` int(11) DEFAULT NULL,
  `carrier` int(11) DEFAULT NULL,
  `rate` int(8) DEFAULT NULL,
  `driver` int(11) DEFAULT NULL,
  PRIMARY KEY (`loadNumber`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
