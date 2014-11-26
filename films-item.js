var request = require('request'),
    baseURL = "http://www.kinopoisk.ru",
    fs = require('fs'),
    LineByLineReader = require('line-by-line'),
    colors = require('colors'),
    iconv = require('iconv-lite'),
    http = require('http'),
    cheerio = require('cheerio');

//add additional encodings
iconv.extendNodeEncodings();

colors.setTheme({
    success: 'green',
    warn: 'yellow',
    error: 'red'
});

//read file line by line
console.log("Began parsing links...");
var lr = new LineByLineReader('data/films-links.txt');
var lineNumber = 1;
//empty file
fs.writeFileSync("data/films-data.txt", "");
lr.on('error', function (err) {
    console.log("Error reading line by line");
    throw err;
});
lr.on('line', function (line) {
    process.stdout.write("Parsing link "+lineNumber +" at " + line + "...                              \x1B[0G");
    lineNumber++;
    lr.pause();

    request({
        url: (baseURL+line),
        encoding:'win1251',
        headers: {
            Host: "www.kinopoisk.ru",
            Connection: "keep-alive",
            Pragma: "no-cache",
            "Cache-Control": "no-cache",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "User-Agent": "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.65 Safari/537.36",
            Referer: "http://www.kinopoisk.ru/top/",
            "Accept-Encoding": "",
            "Accept-Language": "ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4,de;q=0.2,es;q=0.2,it;q=0.2",
            Cookie: "PHPSESSID=c7ff024e4de369452447d4db05fe36c0; my_perpages=%5B%5D; mobile=no; tc=2; awfs=1; last_visit=2014-11-26+22%3A20%3A59; user_country=ru; noflash=false; _ym_visorc_22663942=b"
        }
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {

            console.log("Successful loading".green);

            $ = cheerio.load(body);

            var title = $("title").text();
            var actors = $("#actorList").text();
            actors = actors.replace(/<.*?>/, "").replace(/^\s+|\s+$/, "");

            fs.appendFile("data/films-data.txt", title+"\n");
            fs.appendFileSync("data/films-data.txt", actors+"\n\n");

        } else {
            console.log("Error fetching item page!                      ".error);
        }
        setTimeout(function() {
            //TEST MODE: ONLY FIRST LINK IS PARSED WHILE COMMENTED!!!
              lr.close();
//            lr.resume();
        }, 5000);


    });
});
lr.on('end', function () {
    //clearing line
    process.stdout.write("                                                               ");
    console.log("\nDone!".success);
});