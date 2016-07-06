CREATE DATABASE IF NOT EXISTS `papersoccer`;

CREATE TABLE IF NOT EXISTS `papersoccer.user` (
  `id` int(11) NOT NULL,
  `nickname` varchar(20) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `won_matches` int(11) NOT NULL,
  `lost_matches` int(11) NOT NULL,
  `last_match` varchar(4) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
