const express = require('express');
var http = require('http');
var request = require('request');
var path = require('path');
var fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const app = express();
app.use("main.css", express.static('./main.css'));
app.use("/imgs", express.static('./imgs'));
var main= fs.readFileSync('./index.html');
var scheduleCard = fs.readFileSync('./card.html');
var mainHTML = new JSDOM(main.toString());

 app.get('/', (req, res) => {
	console.log("getting data");
	//res.writeHead(200, { "Content-type": "text/html;charset=UTF-8" });
	request.get('https://feeds.nfl.com/feeds-rs/schedules.json'
	,
	{ json: { key: 'value' } },
	function (error, response ,body) {
		if (!error && response.statusCode == 200) {
			var schedules = body['gameSchedules']
			var results = "";
			for(var i = 0; i < schedules.length; i++) {
				results += schedules[i]['homeNickname'] + ' vs. ' + schedules[i]['visitorNickname'] + ' - ' + schedules[i]['gameTimeEastern'].substring(0,schedules[i]['gameTimeEastern'].length-3)+'ET ' + schedules[i]['gameDate'] +'  @ '+ schedules[i]['site']['siteFullname'] + "\n";	
				var scheduleCardHTML = new JSDOM(scheduleCard.toString());
				scheduleCardHTML.window.document.getElementsByClassName('team1')[0].textContent =schedules[i]['homeNickname'];
				scheduleCardHTML.window.document.getElementsByClassName('team2')[0].textContent =schedules[i]['visitorNickname'];				
				scheduleCardHTML.window.document.getElementsByClassName('time')[0].innerHTML = schedules[i]['gameTimeEastern'].substring(0,schedules[i]['gameTimeEastern'].length-3)+'ET <br />'+schedules[i]['gameDate'];
				mainHTML.window.document.getElementsByClassName("results")[0].appendChild(scheduleCardHTML.window.document.documentElement);
			}
			console.log(results);
			//console.log(scheduleCardHTML.window.document.documentElement.outerHTML);
			//console.log(scheduleCard);
			//console.log(body);
			//res.end(JSON.stringify(schedules));
			res.end(mainHTML.serialize());
		}
	});
});

const server = app.listen(process.env.PORT || 3000, () => {
	console.log('Server is running at 3000');
});
