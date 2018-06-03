'use strict';
if(process.env.LOCAL == false){	
}else{
	require('dotenv').load();
}

// var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var configAuth = require('./auth');
var pg = require('pg');
var parse = require('pg-connection-string').parse;
var config = parse(process.env.DATABASE_URL);
config.ssl = true;

module.exports = function (passport) {
	passport.serializeUser(function (user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function (id, done) {
		var pool = new pg.Pool(config);

		const text = 'SELECT * FROM users WHERE id = $1'; //(id, \"displayName\", gender, locations, city, state)
		const values = [];
		values.push(id);

		pool.connect()
			.then(client => {
				console.log('pg-connected: deser')
				client.query(text, values, function (err, result) {
					client.release();
					if (err) {
						return done(err, null);
					}
					if (result.rowCount == 0) {
						return done(err, null);
					} else {
						//format deserialized user
						var user = {
							id: result.rows[0].id,
							displayName: result.rows[0].displayName,
							gender: result.rows[0].gender,
							locations: result.rows[0].locations,
							city: result.rows[0].city,
							state: result.rows[0].state
						};
						return done(err, user);
					}
				});
			})
			.catch(err => console.error('error connecting', err.stack))
			.then(() => pool.end());
	});

	passport.use(new TwitterStrategy({				
		// clientID: configAuth.twitterAuth.clientID,
		// clientSecret: configAuth.twitterAuth.clientSecret,
		consumerKey: configAuth.twitterAuth.consumerKey,
		consumerSecret:  configAuth.twitterAuth.consumerSecret,
		callbackURL: configAuth.twitterAuth.callbackURL,
		enableProof: true,
		state: true
	},
		function (token, refreshToken, profile, done) { //cb
			process.nextTick(function () {
				var pool = new pg.Pool(config);

				const text = 'SELECT * FROM users WHERE id = $1'; //(id, \"displayName\", gender, locations, city, state)
				const values = [];
				const userId = profile.id;
				values.push(userId);
				// console.log(profile); //testing

				pool.connect()
					.then(client => {
						console.log('pg-connected: verify');
						client.query(text, values, function (err, result) {
							if (err) {
								return done(err, null);
							}							
							if (result.rowCount == 0) {
								// create a new user
								const insertText = 'INSERT INTO users(id, \"displayName\", gender, locations, city, state) VALUES($1, $2, $3, $4, $5, $6) RETURNING *';
								const insertValues = [];
								insertValues.push(userId); //id
								if (profile.displayName) { //displayName
									insertValues.push(profile.displayName);
								} else { insertValues.push(null); }
								if (profile.gender) { //gender
									insertValues.push(profile.gender);
								} else { insertValues.push(null); }
								// if (profile.username) { //username
									// insertValues.push(profile.username);
								// } else { insertValues.push('null'); }
								// if (profile.state) { //gender
								// 	insertValues.push(profile.state);
								// } else { insertValues.push('null'); }
								do {
									insertValues.push(null); //ensure length
								} while (insertValues.length < 6);

								//new postgresql connection
								var pool2 = new pg.Pool(config);
								pool2.connect()
									.then(client2 => {
										console.log('pg-connected2');
										console.log(JSON.stringify(insertValues));
										client2.query(insertText, insertValues, function (err, result) {
											client2.release();
											if (err) {
												console.log("client2 error" + err);
												return done(err, null);
											} else {
												console.log("inserted 1 user: " + result.rows[0].id);
												//format user
												var user = {
													id: result.rows[0].id,
													displayName: result.rows[0].displayName,
													gender: result.rows[0].gender,
													locations: result.rows[0].locations,
													city: result.rows[0].city,
													state: result.rows[0].state
												}

												return done(err, user);
											}
										});//client.query
									})
									.catch(err => console.error('error connecting2', err.stack))
									.then(() => pool2.end());
							}
							//found existing user in db
							else if (result.rowCount == 1) {
								console.log(result);
								console.log("found user in db: " + result.rows[0].id);
								//format user
								var user = {
									id: result.rows[0].id,
									displayName: result.rows[0].displayName,
									gender: result.rows[0].gender,
									locations: result.rows[0].locations,
									city: result.rows[0].city,
									state: result.rows[0].state
								};
								return done(err, user);
							}
						});
					})
					.catch(err => console.error('error connecting', err.stack))
					.then(() => pool.end());
			}); //nextTick (async)
		})); //use callback//passport.use
};
