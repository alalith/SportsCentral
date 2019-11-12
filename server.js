var http = require('http');
var request = require('request');

var server = http.createServer(function(req, res) {
	console.log("getting data");
	res.writeHead(200, { "Content-type": "application/json;charset=UTF-8" });
	request.get('https://feeds.nfl.com/feeds-rs/scores.json'
	,
	{ json: { key: 'value' } },
	function (error, response ,body) {
		if (!error && response.statusCode == 200) {
			//console.log(body);
			res.end(JSON.stringify(body));
			/*
			var d = new Date();
			var iterate;
			if(d.getDate().length==1) {
				iterate = d.getFullYear().toString()+(d.getMonth()+1).toString()+'0'+(d.getDate()+1).toString()+'00';
			}
			else {
				iterate = d.getFullYear().toString()+(d.getMonth()+1).toString()+(d.getDate()-1).toString()+'00';
			
			}
			console.log(iterate);
			var homeScore = body['2019110700']['home']['score']['T'];
			var homeTeam = body['2019110700']['home']['abbr'];
			var awayScore = body['2019110700']['away']['score']['T'];
			var awayTeam = body['2019110700']['away']['abbr'];
			res.end(homeScore + " " + homeTeam + "  - " + awayScore + " " + awayTeam);
			*/
			//console.log(body);
			//var parsedData = JSON.parse(body);
			//res.end(parsedData['2019110700'][0]);
		}
	});
});

server.listen(process.env.PORT || 3000, function() {
	console.log('Server is running at 3000');
});
