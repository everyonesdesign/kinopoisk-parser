var request = require('request'),
    baseURL = "http://www.kinopoisk.ru",
    fs = require('fs'),
    colors = require('colors'),
    iconv = require('iconv-lite');

colors.setTheme({
    success: 'green',
    warn: 'yellow',
    error: 'red'
});

//add additional encodings
iconv.extendNodeEncodings();

//request movies list
console.log("Links fetching...");
request({url: baseURL+"/top", encoding:'win1251'}, function (error, response, body) {

    var regex = /id="top250_place_(.|\n)*?href=".*?"/g,
        matches = body.match(regex);

    if (!error && response.statusCode == 200) {
        //empty file
        fs.writeFileSync("data/films-links.txt", "");
        for (var i=0; i<matches.length; i++) {
            var href = matches[i].replace(/[\s\S]*href="(.*?)"[\s\S]*/, "$1");
            fs.appendFileSync("data/films-links.txt", href+"\n");
        }
        console.log("Done!\n".success);

    } else {
        console.log("Error fetching list page!".error);
    }

});






