const express = require('express');
var http = require('http');
var request = require('request-promise');
var path = require('path');
var fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const app = express();
app.use("main.css", express.static('./main.css'));
app.use("/imgs", express.static('./imgs'));
var main= fs.readFileSync('./index.html');
var scheduleCard = fs.readFileSync('./mdl_card.html');
var mainHTML = new JSDOM(main.toString());
var scores = [];
var gameSchedule = [];
var NBATeams = [];
var latestWeek;
	async function generateEPLData() {
		for(var i = 4291; i <= 4327; i++) {
		//console.log(i);
		await request.get('http://footballapi.pulselive.com/football/fixtures?gameweeks='+i, {json: true})
		.then((body) => {
			var EPLData = body['content']
			for(var j = 0; j < EPLData.length; j++) {
				var matchDate = new Date(EPLData[j]['kickoff']['millis']);	
				var date = matchDate.getDate();
				var month = matchDate.getMonth()+1;
				if(date.toString().length==1) {
					date = '0'+date;
				}
				if(month.toString().length==1) {
					month = '0'+month;
				}		
				var dateIndex = matchDate.getFullYear()+month+date;
				if(gameSchedule[dateIndex]==null) {
					gameSchedule[dateIndex]=[];
				}
				var score1,score2;
				if(EPLData[j]['teams'][0]['score'] == null || EPLData[j]['teams'][1]['score'] == null) {
					score1 = "";
					score2 = "";	
				}
				else {
					score1 = EPLData[j]['teams'][0]['score']; 
					score2 = EPLData[j]['teams'][1]['score']; 

				}
				var nameTeam1 = EPLData[j]['teams'][0]['team']['shortName'];
				var nameTeam2 = EPLData[j]['teams'][1]['team']['shortName']
				if(nameTeam1 == 'AFC Bournemouth') {
					nameTeam1 = 'Bournemouth';
				}	
				else if(nameTeam1 == 'Spurs') {
					nameTeam1 = 'Hotspur';
				}
				if(nameTeam2 == 'AFC Bournemouth') {
					nameTeam2 = 'Bournemouth';
				}	
				else if(nameTeam2 == 'Spurs') {
					nameTeam2 = 'Hotspur';
				}
				var matchTime = matchDate.toLocaleTimeString();
				gameSchedule[dateIndex].push({	
					team1Name: nameTeam1,
					team1Pic: './imgs/epl/'+EPLData[j]['teams'][0]['team']['shortName'].toLowerCase().replace(/ /g,'-')+'.png',
					team1Score: score1,
					team2Name: nameTeam2,	
					team2Pic: './imgs/epl/'+EPLData[j]['teams'][1]['team']['shortName'].toLowerCase().replace(/ /g,'-')+'.png',
					team2Score: score2,
					time: matchTime.substring(0,matchTime.lastIndexOf(':'))+matchTime.substring(matchTime.lastIndexOf(' ')),
					date: month+'/'+date+'/'+matchDate.getFullYear(), 
					gameId: EPLData[j]['id'],
					sport: 'epl'
				});


			}
		});
		}

	}
	async function generateNBATeams() {
		await request.get('http://data.nba.net/data/10s/prod/v1/2019/teams.json', {json: true})
		.then((body) => {
				var NBATeamData = body['league']['standard'];
				for(var i = 0; i < NBATeamData.length; i++) {
					if(NBATeamData[i]['isNBAFranchise']) {
						NBATeams[NBATeamData[i]['teamId']] = {
							teamName:  NBATeamData[i]['nickname'],
							teamPic: './imgs/nba/'+NBATeamData[i]['fullName'].toLowerCase().replace(/ /g,'-')+'.png'
							};
					}
				}	
			});
	}
	async function generateNBAData() {
		await request.get('http://data.nba.net/data/10s/prod/v1/2019/schedule.json', {json: true})
		.then( (body) => {
			var NBAScheduleData = body['league']['standard'];	
			for(var i = 0; i < NBAScheduleData.length; i++) {
				if(NBATeams[NBAScheduleData[i]['hTeam']['teamId']]==null ||NBATeams[NBAScheduleData[i]['vTeam']['teamId']]  == null) {
					continue;
				}
				var dateIndex = NBAScheduleData[i]['startDateEastern'];	
				var year = dateIndex.substring(0,4);
				var month = dateIndex.substring(4,6);
				var date = dateIndex.substring(6,8);
				if(gameSchedule[dateIndex] == null ) {
					gameSchedule[dateIndex] = [];
				}
				var gameTime = NBAScheduleData[i]['startTimeEastern']
				gameTime = (parseInt(gameTime.substring(0,gameTime.indexOf(':')))-1).toString()+gameTime.substring(gameTime.indexOf(':'),gameTime.lastIndexOf(' '));
				gameSchedule[dateIndex].push({	
					team1Name: NBATeams[NBAScheduleData[i]['hTeam']['teamId']]['teamName'],
					team1Pic: NBATeams[NBAScheduleData[i]['hTeam']['teamId']]['teamPic'],
					team1Score: NBAScheduleData[i]['hTeam']['score'],
					team2Name: NBATeams[NBAScheduleData[i]['vTeam']['teamId']]['teamName'],	
					team2Pic: NBATeams[NBAScheduleData[i]['vTeam']['teamId']]['teamPic'],
					team2Score: NBAScheduleData[i]['vTeam']['score'],
					time: gameTime,
					date: month+'/'+date+'/'+year, 
					gameId: NBAScheduleData[i]['gameId'],
					sport: 'nba'
				});
			}
			});
	}
	function generateCards() {
			var beginOfCurrentWeek = new Date();
			beginOfCurrentWeek.setDate(beginOfCurrentWeek.getDate()-beginOfCurrentWeek.getDay());
			beginOfCurrentWeek.setHours(0,0,0,0);
			var endOfCurrentWeek = new Date();
			endOfCurrentWeek.setDate(endOfCurrentWeek.getDate()+6-endOfCurrentWeek.getDay());
			endOfCurrentWeek.setHours(0,0,0,0);
			for(var i = 0; i < gameSchedule.length; i++) {
				if(gameSchedule[i] == null) {
					continue;
				}
				for(var j = 0; j < gameSchedule[i].length; j++) {
					var year = gameSchedule[i][j]['date'].substring(gameSchedule[i][j]['date'].lastIndexOf('/')+1)
					//console.log(year);
					var month = parseInt(gameSchedule[i][j]['date'].substring(0,gameSchedule[i][j]['date'].indexOf('/')))-1;
					var day = gameSchedule[i][j]['date'].substring(gameSchedule[i][j]['date'].indexOf('/')+1,gameSchedule[i][j]['date'].lastIndexOf('/'));
					var d = new Date(year, month, day, 0, 0, 0, 0);
					var scheduleCardHTML = new JSDOM(scheduleCard.toString());
					//if( gameSchedule[i][j]['team1Score'] != null || gameSchedule[i][j]['team2Score'] != null) {
					scheduleCardHTML.window.document.getElementsByClassName('team1Score')[0].textContent = gameSchedule[i][j]['team1Score'];
					scheduleCardHTML.window.document.getElementsByClassName('team2Score')[0].textContent = gameSchedule[i][j]['team2Score'];				
					//}
					scheduleCardHTML.window.document.getElementsByClassName('team1Name')[0].textContent = gameSchedule[i][j]['team1Name'];
					scheduleCardHTML.window.document.getElementsByClassName('team2Name')[0].textContent = gameSchedule[i][j]['team2Name'];				
					scheduleCardHTML.window.document.getElementsByClassName('time')[0].innerHTML = gameSchedule[i][j]['time']+ '<br />'+gameSchedule[i][j]['date'];
					scheduleCardHTML.window.document.getElementsByClassName('team1Pic')[0].src = gameSchedule[i][j]['team1Pic'];
					scheduleCardHTML.window.document.getElementsByClassName('team2Pic')[0].src = gameSchedule[i][j]['team2Pic'];
					if( gameSchedule[i][j]['sport']=='nba') {
						scheduleCardHTML.window.document.getElementsByClassName('result1')[0].style.backgroundColor='#6ab3c4';	
					}
					else if(gameSchedule[i][j]['sport']=='epl') {
						scheduleCardHTML.window.document.getElementsByClassName('result1')[0].style.backgroundColor='#efc538';	
					}
					if(d < beginOfCurrentWeek || d > endOfCurrentWeek) {
						scheduleCardHTML.window.document.getElementsByClassName('result1')[0].style.display = 'none';
					} 
					/*
					else {
						console.log(d.getFullYear() + ' ' +d.getMonth() + ' ' + d.getDate());
					}
					*/
					mainHTML.window.document.getElementsByClassName('day')[d.getDay()].appendChild(scheduleCardHTML.window.document.documentElement);
				}
			}	


	}
	function processNFLScoreWeek(body) {
		var gameScoresCurrentWeek = body['gameScores'];
		for(var j = 0; j < gameScoresCurrentWeek.length; j++) {
			var gameIndex = gameScoresCurrentWeek[j]['gameSchedule']['gameId'];
			//console.log(gameIndex);
			//console.log(gameSchedule[dateIndex]);
			var dateIndex = gameIndex.toString().substring(0,gameIndex.toString().length-2);
			if(gameScoresCurrentWeek[j]['score'] == null) {
				for(var k = 0; k < gameSchedule[dateIndex].length; k++) {
					if(gameSchedule[dateIndex][k]['gameId'] == gameIndex) {
						gameSchedule[dateIndex][k].team1Score = "";
						gameSchedule[dateIndex][k].team2Score = "";
						break;
					}
				}	
				continue;

			}
			for(var k = 0; k < gameSchedule[dateIndex].length; k++) {
				if(gameSchedule[dateIndex][k]['gameId'] == gameIndex) {
					gameSchedule[dateIndex][k].team1Score = gameScoresCurrentWeek[j]['score']['homeTeamScore']['pointTotal'];
					gameSchedule[dateIndex][k].team2Score = gameScoresCurrentWeek[j]['score']['visitorTeamScore']['pointTotal'];
					break;
				}
			}	
			//console.log(dateIndex);
		}

	}
	async function addNFLScoreData(){
		await request('https://feeds.nfl.com/feeds-rs/scores.json', {json: true})
		    .then(async (parsedBody) => {
			var maxWeek = parsedBody['week'];
			processNFLScoreWeek(parsedBody);
			for(var i = 1; i < maxWeek; i++) {
				if(i < 18) {
					await request('https://feeds.nfl.com/feeds-rs/scores/2019/REG/'+i+'.json',{json: true}).then(processNFLScoreWeek, console.log);
				}
				else {
					await request('https://feeds.nfl.com/feeds-rs/scores/2019/POST/'+i+'.json',{json: true}).then(processNFLScoreWeek, console.log);
				}
			}
		    });//.then(() => { console.log(gameSchedule) });
	}
	function generateNFLschedule(body) {
		var schedules = body['gameSchedules']
		var results = "";
		var j = 0;
		for(var i = 0; i < schedules.length; i++) {
			var date = schedules[i]['gameDate'];
			var dateIndex = date.substring(date.lastIndexOf('/')+1)+date.substring(0,date.indexOf('/'))+date.substring(date.indexOf('/')+1,date.lastIndexOf('/'));
			gameSchedule[dateIndex]= [];
		}
		for(var i = 0; i < schedules.length; i++) {
			results += schedules[i]['homeNickname'] + ' vs. ' + schedules[i]['visitorNickname'] + ' - ' + schedules[i]['gameTimeEastern'].substring(0,schedules[i]['gameTimeEastern'].length-3)+' ET ' + schedules[i]['gameDate'] +'  @ '+ schedules[i]['site']['siteFullname'] + "\n";	
			//var scheduleCardHTML = new JSDOM(scheduleCard.toString());
			var date = schedules[i]['gameDate'];
			var dateIndex = date.substring(date.lastIndexOf('/')+1)+date.substring(0,date.indexOf('/'))+date.substring(date.indexOf('/')+1,date.lastIndexOf('/'));
			var gameTime = schedules[i]['gameTimeEastern'].substring(0,schedules[i]['gameTimeEastern'].length-3);
			var gameTimeHour = parseInt(gameTime.substring(0,gameTime.indexOf(':')));
			var isAM = gameTimeHour-1 < 12;
			var trueGameHour = (gameTimeHour-1)%12;
			if(trueGameHour == 0) {
				trueGameHour = 12;
			}
			var trueGameTime = trueGameHour + gameTime.substring(gameTime.indexOf(':'));
			if(isAM) {
				trueGameTime += ' AM';
			}
			else {
				trueGameTime += ' PM';
			}
			gameSchedule[dateIndex].push({	
				team1Name: schedules[i]['homeNickname'],
				team1Pic: './imgs/nfl/'+schedules[i]['homeDisplayName'].toLowerCase().replace(/ /g,'-')+'.png',
				team1Score: '',
				team2Name: schedules[i]['visitorNickname'],	
				team2Pic: './imgs/nfl/'+schedules[i]['visitorDisplayName'].toLowerCase().replace(/ /g,'-')+'.png',
				team2Score: '',
				time: trueGameTime,
				date: schedules[i]['gameDate'],
				gameId: schedules[i]['gameId'],
				sport: 'nfl'
			});
			//scheduleCardHTML.window.document.getElementsByClassName('team1')[0].innerHTML = schedules[i]['homeNickname']+'<img class="teampic" src="./imgs/nfl/'+schedules[i]['homeDisplayName'].toLowerCase().replace(/ /g,'-')+'.png"/>';
			//scheduleCardHTML.window.document.getElementsByClassName('team2')[0].innerHTML = schedules[i]['visitorNickname']+'<img class="teampic" src="./imgs/nfl/'+schedules[i]['visitorDisplayName'].toLowerCase().replace(/ /g,'-')+'.png"/>';				
			//scheduleCardHTML.window.document.getElementsByClassName('time')[0].innerHTML = schedules[i]['gameTimeEastern'].substring(0,schedules[i]['gameTimeEastern'].length-3)+' ET <br />'+schedules[i]['gameDate'];
			//mainHTML.window.document.getElementsByClassName("day")[(j++ % 7)].appendChild(scheduleCardHTML.window.document.documentElement);
		}

		//console.log(gameSchedule);
		//console.log(results);
		//console.log(scheduleCardHTML.window.document.documentElement.outerHTML);
		//console.log(scheduleCard);
		//console.log(body);
		//res.end(JSON.stringify(schedules));
	}
 app.get('/', (req, res) => {
	console.log("getting data");
	//res.writeHead(200, { "Content-type": "text/html;charset=UTF-8" });
		/*
	request.get('https://feeds.nfl.com/feeds-rs/scores.json'
	,
	{ json: { key: 'value' } },
	function (error, response ,body) {
		latestWeek = body['week'];
		for(var i=1;i<=latestWeek;i++) {
			request.get('https://feeds.nfl.com/feeds-rs/scores.json'
			,
			{ json: { key: 'value' } },
			function (error, response ,body) {
				latestWeek = body['week'];
				for(var i=1;i<=latestWeek;i++) {
						
				}
			});
		}
	});
		*/
	//console.log(latestWeek);
	res.end(mainHTML.serialize());
});
	

const server = app.listen(process.env.PORT || 3000, () => {
	console.log('Server is running at 3000');
	request.get('https://feeds.nfl.com/feeds-rs/schedules.json', {json: true})
	.then(generateNFLschedule, console.log)
	.then(addNFLScoreData)
	//.then( () => { console.log(gameSchedule) })
	.then(generateNBATeams)
	//.then( () => { console.log(NBATeams) })
	.then(generateNBAData)
	//.then( () => { console.log(gameSchedule) })
	.then(generateEPLData)
	.then(generateCards)
	.then( () => {
		console.log("done!");
	});			
});
