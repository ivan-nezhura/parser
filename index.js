const start = Date.now();
const log = console.log.bind(console);
const fileLog = require('simple-node-logger').createSimpleFileLogger('parser.log');

const Crawler = require("node-webcrawler");
const URL = require('url-parse');
const db = require('./db');

const site = {
    id : 1,
    url : 'http://eapermanent.com/'//https://kodi-professional.ua/'
};

// getting start url
//db.query(`SELECT uri FROM site WHERE id = ${site.id}`, (error, results, fields) => {site.url = results.pop().uri;});


let pagesVisited = [];
let exploredPages = [];

const query = db.query(`SELECT uri FROM page WHERE site_id = ${site.id}`, (error, results, fields) => {
    if (error)
        throw error;

    exploredPages = results.map(row => row.uri);
});

query.on('end', () => {
    addToCrawlerQueue(site.url, true);
    c.queue(exploredPages);
});




const url = new URL(site.url);
const baseUrl = url.protocol + "//" + url.hostname;





const c = new Crawler({
    maxConnections : 100,
    //rateLimits:305,
    callback : function (error, result, $) {
        if(error){
            console.error(error);
        }else{
            pagesVisited.push(result.options.uri);

            if ($)
                collectInternalLinks($);

            log(`VISITED : ${Object.keys(pagesVisited).length}, REMAINING : ${c.queueSize}, TOTAL EXPLORED NEW : ${exploredPages.length}\n`);
        }
    },
    onDrain : function () {
        log('---***--- FINISH ---***---');
        log(`visited pages : ${pagesVisited.length}\n`);
        log('Time left : ' + (Date.now() - start)/1000 + 's\n');

        db.destroy();
    }
});


// library
function addToCrawlerQueue(link) {
    //images todo-in так наверно не совсем правильно
    const extension = link.substr(link.length - 4);
    const conditionToAddToQueue =
        exploredPages.indexOf(link) === -1
        && extension !== '.jpg'
        && extension !== '.png'
        && extension !== '.gif';

    if (conditionToAddToQueue){
        //log(`add to queue : ${link}\n`);
        //console.log(pagesVisited);
        c.queue(link);

        exploredPages.push(link);

        if (link === 'https://kodi-professional.ua/kosmetika-spa/uhod-za-rukami/piling-s-fruktovymi-kislotami-dlya-ruk-i-nog200-ml/') {
            log('adding ' + link);
        }

        const sql = `INSERT INTO page SET site_id = ${site.id}, uri = ${db.escape(link)}`;
        fileLog.info(sql);
        db.query(sql);
    }
}

function collectInternalLinks($) {
    const relativeLinks = $("a[href^='/']");
    const absoluteLinks = $("a[href^='http']");

    relativeLinks.each(function() {
        const link = $(this).attr('href');

        if (link.indexOf('//') !== 0) {
            const nextPage = baseUrl + link;
            addToCrawlerQueue(nextPage);
        }
    });


    absoluteLinks.each(function() {
        const link = $(this).attr('href');
        const url = new URL(link);

        const isInternalLink = (url.protocol + "//" + url.hostname) === baseUrl;
        if(isInternalLink)
            addToCrawlerQueue(link);

    });
}