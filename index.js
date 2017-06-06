const start = Date.now();
const log = console.log.bind(console);
const fileLog = require('simple-node-logger').createSimpleFileLogger('parser.log');

const Crawler = require("node-webcrawler");
const URL = require('url-parse');
const db = require('./db');
const pageWork = require('./pageWorker');

/*const site = {
    id : 1,
    url : 'http://eapermanent.com/'
};*/

const site = {
    id : 2,
    url : 'https://kodi-professional.kz/'
};

/*const site = {
    id : 3,
    url : 'https://kodi-professional.ua/'
};*/

// getting start url
//db.query(`SELECT uri FROM site WHERE id = ${site.id}`, (error, results, fields) => {site.url = results.pop().uri;});


let pagesVisited = [];
let exploredPages = [];
let startExplored = 0;

const query = db.query(`SELECT uri FROM page WHERE site_id = ${site.id}`, (error, results, fields) => {
    if (error)
        throw error;

    exploredPages = results.map(row => row.uri);
    startExplored = exploredPages.length;
});

query.on('end', () => {
    c.queue(site.url);
    c.queue(exploredPages);
});




const url = new URL(site.url);
const baseUrl = url.protocol + "//" + url.hostname;





const c = new Crawler({
    maxConnections : 250,
    //rateLimits:100,
    callback : function (error, result, $) {
        if(error){
            console.error(error);
        }else{
            pagesVisited.push(result.options.uri);

            // analyse page
            pageWork(site.id, result, $);

            if ($) collectInternalLinks($);

            log(`VISITED : ${Object.keys(pagesVisited).length}, REMAINING : ${c.queueSize}, TOTAL EXPLORED NEW : ${getExploredNew()}\n`);
        }
    },
    onDrain : function () {
        const sec = (Date.now() - start)/1000;

        log('\n---***--- FINISH ---***---');
        log(`visited pages : ${pagesVisited.length}\n`);
        log(`explored new : ${getExploredNew()}\n`);
        log(`Time left : ${sec}s (${(sec/60).toFixed(2)}m)\n`);

        db.destroy();
    }
});


// library
function addToCrawlerQueue(freshLink) {
    const link = freshLink.trim();

    //images todo-in так наверно не совсем правильно
    const extension = link.substr(link.length - 4);
    const conditionToAddToQueue =
        exploredPages.indexOf(link) === -1
        && extension !== '.jpg'
        && extension !== '.png'
        && extension !== '.gif';

    if (conditionToAddToQueue){

        c.queue(link);

        exploredPages.push(link);

        const sql = `INSERT INTO page SET site_id = ${site.id}, uri = ${db.escape(link)}`;
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

function getExploredNew() {
    return exploredPages.length - startExplored;
}