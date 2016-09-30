var request = require('request'),
    fs = require('fs'),
    cheerio = require('cheerio'),
    csvWriter = require('csv-write-stream');

var writer = csvWriter();
//EDIT THE WRITE STREAM OUTPUT TARGET
writer.pipe(fs.createWriteStream('tutsplus-out.csv'));

//EDIT THE BASE URL
var link = 'https://code.tutsplus.com/tutorials',
    counter = 1;

function makeHttp(link){
  var options = {
      url: link,
      headers: {'User-Agent': 'request'}};

  request(options, function(error, response, html){
    if (!error && (response.statusCode !== 404)) {
      counter++;
      processHtml(html);
    }
    else console.error(error);
  });
}

function processHtml(html) {
  var $ = cheerio.load(html);
  var articles = $('article');
  articles = [].slice.call(articles);
  articles.forEach(function(article){
    console.log('title', $(article).find('h1').text());
    var title = $(article).find('h1').text();
    var author = $(article).find('.posts__post-author-link').text();
    var tag = $(article).find('.topic-code').text();
    var href = $(article).find('.posts__post-title').attr('href');

    var writeObj = {title: title, author: author, tags: tag, link: href, source: 'Envato Tuts+'};
    writer.write(writeObj);
  });
  link = 'https://code.tutsplus.com/tutorials?page=' + counter;
  console.log('making request', link);
  makeHttp(link);
}

makeHttp(link);
