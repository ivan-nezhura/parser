// ENTITIES TO PROCESS
// todo analyse all entities
// title
// description
// h1
// content
// robots.txt
// tag robots
// PHP errors
// domain expired
// SSL sertificate

const db = require('./db');
const log = console.log.bind(console);
const notify = require('simple-node-logger').createSimpleFileLogger('notification.log');


let processed = [];

module.exports = function (siteId, result, $) {
    const uri = result.options.uri.trim();
    if (processed.indexOf(uri) !== -1) return;
    processed.push(uri);

    if (!$) {
        //todo

        return;
    }

    //title
    const titleQuery = `
        SELECT 
            value
        FROM 
            title 
        WHERE 
            site_id = ${siteId}
            AND uri = \'${uri}\'
        ORDER BY dt DESC
        LIMIT 1
        `;
    db.query(titleQuery, (error, results, fields) => {
        if (error) throw error;

        const title = $('title').text();

        if (!title) {
            // todo
        } else {
            const newTitleSql = `
            INSERT INTO title 
            SET 
                site_id = ${siteId},
                uri = \'${uri}\',
                value = \'${title}\'
            `;
            db.query(newTitleSql);

        }

        if (results.length === 0) {
            //first scan
            //todo
        } else {
            const oldTitle = results[0].value;
            if (title !== oldTitle)
                notify.info(`need to notify. Old : ${oldTitle}. New : ${title}`);
        }
        //log(`previous title : `);
    });
}