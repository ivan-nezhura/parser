const db = require('./db');

const createSiteTableSql = `
CREATE TABLE \`site\` (
  \`id\` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  \`uri\` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8
`;

const createPageTableSql = `
CREATE TABLE \`page\` (
  \`site_id\` int(11) NOT NULL,
  \`uri\` varchar(255) NOT NULL,
  PRIMARY KEY(site_id, uri)
) ENGINE=InnoDB DEFAULT CHARSET=utf8
`;
/*
const createScanEntityTableSql = `
CREATE TABLE \`scan_entity\` (
  \`id\` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  \`name\` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8
`;*/

const createTitleTableSql = `
CREATE TABLE \`title\` ( 
    \`site_id\` INT NOT NULL , 
    \`uri\` VARCHAR(255) NOT NULL ,
     \`value\` VARCHAR(255) NULL ,
      \`dt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ,
       PRIMARY KEY (\`site_id\`, \`uri\`, \`dt\`)
) ENGINE = InnoDB;
`;

db.query(createPageTableSql);
db.query(createSiteTableSql);
/*db.query(createScanEntityTableSql);*/
db.query(createTitleTableSql);

const insertProjects = `
INSERT INTO site (uri) VALUES (\'http://eapermanent.com/\'),(\'https://kodi-professional.kz/\'),(\'https://kodi-professional.ua/\') 
`;
/*

const insertScanEntities = `
INSERT INTO 
    scan_entity (name) 
VALUES 
    (\'title\'),
    (\'description\'),
    (\'h1\'),
    (\'content\'),
    (\'robots.txt\'),
    (\'tag robots\'),
    (\'PHP errors\'),
    (\'domain expired\'),
    (\'SSL sertificate\')
     
`;
*/

db.query(insertProjects);
/*db.query(insertScanEntities);*/

