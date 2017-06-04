const start = Date.now();
const log = console.log.bind(console);

const Crawler = require("node-webcrawler");
const URL = require('url-parse');
const db = require('./db');

const site = {
    id : 1,
    url : 'http://eapermanent.com/'
};

// getting start url
//db.query(`SELECT uri FROM site WHERE id = ${site.id}`, (error, results, fields) => {site.url = results.pop().uri;});


let pagesVisited = [];
let exploredPages = [];

const query = db.query(`SELECT uri FROM page WHERE site_id = ${site.id}`, (error, results, fields) => {
    exploredPages = results.map(row => row.uri);
});

query.on('end', () => {
    addToCrawlerQueue(site.url, true);
    c.queue(exploredPages);
});




const url = new URL(site.url);
const baseUrl = url.protocol + "//" + url.hostname;





const c = new Crawler({
    maxConnections : 50,
    //rateLimits:305,
    callback : function (error, result, $) {
        if(error){
            console.error(error);
        }else{
            pagesVisited.push(result.options.uri);

            if ($)
                collectInternalLinks($);


            console.log(`PAGE VISITED : ${result.options.uri}\n`);
            console.log(`TOTAL VISITED : ${Object.keys(pagesVisited).length}\n`);
        }
    },
    onDrain : function () {
        console.log(`visited pages : ${pagesVisited.length}\n`);
        console.log('Time left : ' + (Date.now() - start)/1000 + 's\n');

        db.destroy();
    }
});


// library
function addToCrawlerQueue(link, startUrl = false) {
    //images todo-in так наверно не совсем правильно
    const extension = link.substr(link.length - 4);

    const conditionToAddToQueue =
        exploredPages.indexOf(link) === -1
        && extension !== '.jpg'
        && extension !== '.png'
        && extension !== '.gif';

    if (conditionToAddToQueue){
        console.log(`add to queue : ${link}\n`);
        //console.log(pagesVisited);
        c.queue(link);
        exploredPages.push(link);

        if (!startUrl) {
            const sql = `INSERT INTO page SET site_id = ${site.id}, uri = ${db.escape(link)}`;
            db.query(sql);
        }

        console.log(`__explored pages : ${exploredPages.length}\n`);
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