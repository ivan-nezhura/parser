const start = Date.now();

const Crawler = require("node-webcrawler");
const URL = require('url-parse');


const startUrl = 'http://eapermanent.com';//';//https://kodi-professional.kz/';// //"https://kodi-professional.ua";

const url = new URL(startUrl);
const baseUrl = url.protocol + "//" + url.hostname;

let pagesVisited = [];
let exploredPages = [];

const c = new Crawler({
    maxConnections : 50,
    rateLimits:305,
    callback : function (error, result, $) {
        if(error){
            console.error(error);
        }else{
            pagesVisited.push(result.options.uri);
            collectInternalLinks($);

            console.log(`PAGE VISITED : ${result.options.uri}\n`);
            console.log(`TOTAL VISITED : ${Object.keys(pagesVisited).length}\n`);
        }
    },
    onDrain : function () {
        console.log(`visited pages : ${pagesVisited.length}\n`);
        //console.log(pagesVisited);
        console.log('Time left : ' + (Date.now() - start)/1000 + 's\n');
    }
});




addToCrawlerQueue(startUrl);


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
        console.log(`add to queue : ${link}\n`);
        //console.log(pagesVisited);
        c.queue(link);
        exploredPages.push(link);

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