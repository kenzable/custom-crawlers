var request = require('request'),
    fs = require('fs'),
    cheerio = require('cheerio'),
    csvWriter = require('csv-write-stream');

var writer = csvWriter();
//EDIT THE WRITE STREAM OUTPUT TARGET
writer.pipe(fs.createWriteStream('smash-out.csv'));

//EDIT THE BASE URL
var link = 'https://www.smashingmagazine.com/category/coding/',
    counter = 1;

function makeHttp(link){
  request(link, function(error, response, html){
    if (!error && response.statusCode === 200) {
      console.log('we are here');
      counter++;
      processHtml(html);
    }
    else console.error(error);
  });
  console.log(link, counter);
}

function processHtml(html) {
  var $ = cheerio.load(html);
  var posts = $('div.main')
  posts = $(posts).find('.post');
  posts = [].slice.call(posts);

  posts.forEach(function(post){
    var title = $(post).find('h2 a span')
    title = $(title).text();
    title = title.trim();

    var author = $(post).find('a[rel="author"]');
    author = $(author).text();

    var tags = $(post).find('.tags a');
    var finalTags = [];
    tags = [].slice.call(tags);
    tags.forEach(function(tag){
      finalTags.push($(tag).text());
    });
    tags = finalTags.join(',')

    var href = $(post).find('h2 a').attr('href');

    var writeObj = {title: title, author: author, tags: tags, link: href, source: 'Smashing Magazine'};
    console.log('write obj', writeObj);

    writer.write(writeObj);
  });
  link = 'https://www.smashingmagazine.com/category/coding/page/' + counter;
  makeHttp(link);
}

makeHttp(link);
