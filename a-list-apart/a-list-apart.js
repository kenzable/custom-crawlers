var request = require('request'),
    fs = require('fs'),
    cheerio = require('cheerio'),
    csvWriter = require('csv-write-stream');

var writer = csvWriter();
//EDIT THE WRITE STREAM OUTPUT TARGET
writer.pipe(fs.createWriteStream('a-list-out.csv'));

//EDIT THE BASE URL
var link = 'http://alistapart.com/articles',
    counter = 0;

function initialHttp(link){
  request(link, function(error, response, html){
    if (!error && response.statusCode === 200) {
      counter += 10;
      initialHtml(html);
    }
    else console.error(error);
  });
}

function initialHtml(html) {
  var $ = cheerio.load(html);
  var linkList = $('.entry-title a');
  linkList = [].slice.call(linkList);
  linkList = linkList.forEach(function(link){
    var href = $(link).attr('href');
    makeHttp(href);
  });
}

function makeHttp(link){
  request(link, function(error, response, html){
    if (!error && response.statusCode === 200) {
      console.log('we are here');
      counter += 10;
      processHtml(html);
    }
    else console.error(error);
  });
  console.log(link, counter);
}

function processHtml(){
  var cards = $('div.card');
  cards = [].slice.call(cards);
  cards.forEach(function(card){
    var text = $(card).find('.text');
    var title = $(text[0]).text().trim();
    var author = $(text[1]).text().trim();
    var tags = $(card).find('.tags').text();
    tags = tags.trim();
    tags = tags.replace(/\n/g, ',');
    var href = $(card).find('a.tile').attr('href');

    var writeObj = {title: title, author: author, tags: tags, link: href};
    console.log('write obj', writeObj);

    writer.write(writeObj);
  });
  link = 'https://scotch.io/tutorials/P' + counter;
  makeHttp(link);
}




makeHttp(link);
