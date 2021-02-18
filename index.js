/**
 * 
 * Usage:
 * node index.js -i DIRECTORY -o OUTPUT_FOLDER
 * node index.js -i http://ezshare.card/dir?dir=A:%5CDCIM%5C589___01 -o out
 * 
 */
var http = require('http');
var fs = require('fs');
var argv = require('minimist')(process.argv.slice(2));
var axios = require('axios');
var cheerio = require('cheerio');
var async = require('async');

// var folder = "http://ezshare.card/dir?dir=A:%5CDCIM%5C589___01";
const input = argv.i;
const output = './'+argv.o;
const fullsync = argv.f;
const filesTmpNow = [];

console.log(`Start sync in ${fullsync == "y" ? "full mode (check output folder every iteration)" : "not full mode (not checking output folder, save in temporary variable)"}`);

if (!fs.existsSync(output)){
  fs.mkdirSync(output);
}

var download = function (url, dest, cb) {
  console.log('Download: '+url);
  var file = fs.createWriteStream(dest);
  var request = http.get(url, function (response) {
    response.pipe(file);
    file.on('finish', function () {
      console.log("Ok: "+url);
      filesTmpNow.push(url);
      file.close(cb); // close() is async, call cb after close completes.
    });
  }).on('error', function (err) { // Handle errors
    fs.unlink(dest); // Delete the file async. (But we don't check the result)
    if (cb) cb(err.message);
  });
};

// Get files from SD Card and save to folder
let inProcess = false;

function start() {

  console.log();
  console.log('Start iteration');
  inProcess = true;

  // Get all files from output folder
  const filesNow = [];
  fs.readdirSync(output).forEach(file => {
    filesNow.push(file);
  });

  axios.get(input)
    .then((response) => {
      if (response.status === 200) {
        const html = response.data;
        const $ = cheerio.load(html);

        const files = [];
        $('pre a').map(function (i, el) {
          const href = $(this).attr('href');
          if (href.includes("download")) {

            const filename = href.split("file=")[1];
            if (fullsync == "y") {
              if (!filesNow.includes(filename)) {
                files.push({
                  "href": href,
                  "name": filesNow.length+"."+filename.split(".")[1]
                })
              }
            } else {
              if (!filesTmpNow.includes(href)) {
                files.push({
                  "href": href,
                  "name": filesNow.length+"."+filename.split(".")[1]
                })
              }
            }

          }
        });

        async.eachLimit(files, 2, function (file, next) {
          download(file.href, output+'/'+file.name, next);
        }, function () {
          console.log('Finished');
          inProcess = false;
        })
      }
    })
    .catch((err) => {
      throw new Error(err);
    });
}

setInterval(function(){
  if (!inProcess) {
    start();
  } else {
    console.log('Previous work is not completed');
  }
}, 5000);
