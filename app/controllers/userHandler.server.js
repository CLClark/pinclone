'use strict';
if (process.env.LOCAL !== false) {
	require('dotenv').load();
}

const https = require('https');
const querystring = require('querystring');
var pg = require('pg');
var parse = require('pg-connection-string').parse;
var config = parse(process.env.DATABASE_URL);

function UserHandler() {

	this.updateProfile = function (req, res) {
		console.log('updateProfile callback');
		console.log(req.body);
		let nameUpdate = req.body.pname.substring(0, 20);
		// req.user.displayName = nameUpdate;
		// res.sendStatus(200);
		// res.redirect(302, '/');
		updateUser();

		function updateUser() {
			function textMaker() {
				return new Promise((resolve, reject) => {
					let queryStart = "UPDATE users ";
					let valueStore = [];

					let rawForm = req.body;
					let parsedForm = {};

					let reassemble = Object.keys(rawForm).map((re) => {
						return new Promise((rezolve, rezect) => {
							console.log(rawForm[re]);
							if(rawForm[re].length > 1){
								parsedForm[re] = rawForm[re];
								rezolve();
							}				
							else{
								rezolve(false);
							}
						});
					});//reassemble map
	
					let varCounter = 1;
					Promise.all(reassemble)
					.then((assembled) => {
						let cap = Object.keys(parsedForm).length - 1;
						var combNots = Object.keys(parsedForm).reduce(function (acc, cVal, cInd, array) {
							if (parsedForm[cVal].length > 1) {
								valueStore.push(parsedForm[cVal]);
								varCounter++; //$2, $3... $n etc
								if (cVal == "pname") {
									return (prePend(' \"displayName\" = '));
								} else if (cVal == "pcity") {
									return (prePend(" city = "));
								} else if (cVal == "pstate") {
									return (prePend(" state = "));
								}
								function prePend(prefix) {
									if (cInd < cap) {
										return acc.concat((prefix + '$' + (varCounter) + ', '));
									} else {
										return acc.concat((prefix + '$' + (varCounter)));
									}
								}
							}
						}, (queryStart.concat(' SET '))
						);
						resolve([combNots.concat(' WHERE users.id = $1 RETURNING *'), valueStore]);
					}).catch((e) => {
						reject();
						console.log(e)
					});
				});
			}

			textMaker()
				.then((tvArray) => {
					//check  if the array has more than 1 value (more than just userid)
					if (tvArray[1].length == 1 || tvArray[1].length == 0) {
						res.redirect(302,'/profile');
						// return;
					} else {
						var pool = new pg.Pool(config);

						const text = tvArray[0];
						var values = [req.user.id];
						values = values.concat(tvArray[1]);
						console.log(tvArray);
						pool.connect()
							.then(client => {
								// console.log('pg-connected: deser')
								client.query(text, values, function (err, result) {
									client.release();
									if (err) {
										console.log(err);
										res.redirect(302, 'profile');
									}
									if (result.rowCount == 0) {
										console.log("rowcount zero : " + result);
										res.redirect(302, '/profile');
									} else {
										// console.log(result);
										res.redirect(302, '/profile');
									}
								});
							})
							.catch(err => console.error('error connecting', err.stack))
							.then(() => pool.end());
					}
				}).catch((e) => { console.log(e); });
		}
	} //updateProfile	

}//UserHandler

module.exports = UserHandler;