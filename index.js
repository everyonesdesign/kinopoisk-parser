var request = require('request'),
    baseURL = "http://www.kinopoisk.ru",
    fs = require('fs'),
    LineByLineReader = require('line-by-line'),
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
        fs.writeFileSync("links.txt", "");
        for (var i=0; i<5; i++) {
            var href = matches[i].replace(/[\s\S]*href="(.*?)"[\s\S]*/, "$1");
            fs.appendFileSync("links.txt", href+"\n");
        }
        console.log("Done!\n".success);

        //read file line by line

        console.log("Began parsing links...");
        var lr = new LineByLineReader('links.txt');
        var lineNumber = 1;
        //empty file
        fs.writeFileSync("data.txt", "");
        lr.on('error', function (err) {
            console.log("Error reading line by line");
        });
        lr.on('line', function (line) {
            process.stdout.write("Parsing link "+lineNumber + "/" + matches.length +" at " + line + "...                              \x1B[0G");
            lineNumber++;
            lr.pause();
            request({url: baseURL+line, encoding:'win1251'}, function(error, response, body) {
                if (!error && response.statusCode == 200) {

                    var h1 = body.replace(/[\s\S]*<h1.*?>\s*(.*?)\s*<\/h1>[\s\S]*/, "$1");
                    fs.appendFileSync("data.txt", h1+"\n");

                } else {
                    console.log("Error fetching item page!".error);
                }
                setTimeout(function() {
                    lr.resume();
                }, 5000);

            });
        });
        lr.on('end', function () {
            //clearing line
            process.stdout.write("                                                               ");
            console.log("\nDone!".success);
        });
    } else {
        console.log("Error fetching list page!".error);
    }

});