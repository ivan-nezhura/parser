const config = require('./config');
const mysql      = require('mysql');

module.exports = mysql.createConnection({
    host     : config.db_host,
    user     : config.db_user,
    password : config.db_password,
    database : config.db_database
});
