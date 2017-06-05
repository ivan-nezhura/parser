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

db.query(createPageTableSql);
db.query(createSiteTableSql);