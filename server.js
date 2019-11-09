var http = require('http');
var request = require('request');

var server = http.createServer(function(req, res) {
	res.writeHead(200, { "Content-type": "text/plain" });
	request.post(
	'http://www.nfl.com/liveupdate/scores/scores.json',
	{ json: { key: 'value' } },
	function (error, response ,body) {
		if (!error && response.statusCode == 200) {
			//console.log(body);
			//res.end(JSON.stringify(body));
			var homeScore = body['2019110700']['home']['score']['T'];
			var homeTeam = body['2019110700']['home']['abbr'];
			var awayScore = body['2019110700']['away']['score']['T'];
			var awayTeam = body['2019110700']['away']['abbr'];
			res.end(homeScore + " " + homeTeam + "  - " + awayScore + " " + awayTeam);
			//console.log(body);
			//var parsedData = JSON.parse(body);
			//res.end(parsedData['2019110700'][0]);
		}
	});
});

server.listen(process.env.PORT || 3000, function() {
	console.log('Server is running at 3000');
});
