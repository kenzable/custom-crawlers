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
    makeHttp('http://alistapart.com' + href);
  });
  link = 'http://alistapart.com/articles/P' + counter;
  initialHttp(link);
}

function makeHttp(link){
  request(link, function(error, response, html){
    if (!error && response.statusCode === 200) {
      processHtml(html, link);
    }
    else console.error(error);
  });
}

function processHtml(html, link){
  var $ = cheerio.load(html);
  var title = $($('.entry-title')[0]).text();
  var author = $($('.author span')[0]).text();
  var tags = $('a span[itemprop="about"]');
  var finalTags = [];
  tags = [].slice.call(tags);
  tags.forEach(function(tag){
    finalTags.push($(tag).text());
  });
  tags = finalTags.join(',');
  var writeObj = {title: title, author: author, tags: tags, link: link, source: 'A List Apart'};
  console.log('writing', link);

  writer.write(writeObj);
}

initialHttp(link);
