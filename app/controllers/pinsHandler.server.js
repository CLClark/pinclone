'use strict';
if (process.env.LOCAL !== false) {
	require('dotenv').load();
}

const https = require('https');
const querystring = require('querystring');
var pg = require('pg');
var parse = require('pg-connection-string').parse;
var config = parse(process.env.DATABASE_URL);
var url = require('url'); 

function PinsHandler() {

	/** */
	this.allBooks = function (req, res) {
		console.log('allBooks callback');
		var searchTerm = req.query.terms;
		//save to session...
		req.session.lastSearch = searchTerm;

		// console.log(req.session.lastSearch);
		const queryData = querystring.stringify({
			q: searchTerm.toString(),
			// orderBy: 'relevance',
			// printType: 'books',			
			// maxResults: 20,
			key: process.env.API_KEY
		});
		console.log(queryData);
		// console.log(querystring.escape(queryData));

		const options = {
			hostname: 'content.googleapis.com',
			port: 443,
			path: ('/books/v1/volumes?' + queryData),
			method: 'GET',
			headers: {
				'user-agent': 'clclarkFCC/1.0',
				'Accept-Language': 'en-US',
				'Connection': 'keep-alive'
			}
		};
		const sreq = https.request(options, (res2) => {
			var body1 = [];
			console.log(`STATUS: ${res2.statusCode}`);
			// console.log(`HEADERS: ${JSON.stringify(res2.headers)}`);

			res2.on('data', (d) => {
				body1.push(d);
				// console.log(d);
			});
			res2.on('end', () => {
				// console.log(body1);
				// console.log(JSON.parse(Buffer.concat(body1).toString()));
				try {
					var resJSON = JSON.parse(Buffer.concat(body1).toString());
					bookBuilder(resJSON.items, false)
						.then((result) => {
							res.json(result);
						})
						.catch();
					// console.log("all books");

					// bookBuilder(resJSON.items, false)
					/*	.then((middleware) => {
							return bookBuilder2(middleware, req.query.timeframe)//returns an array {yelpid: id, count: number}
								.then((bb2) => {
									let mapped = middleware.map((eachB) => {
										return new Promise((rezolve, rezect) => {
											var oldB = 0;
											if (bb2.length > 0) {
												bb2.forEach(apptCount => {
													oldB++;
													if (apptCount.yelpid == eachB.id) {
														eachB["count"] = apptCount.count;
														// console.log("---");
														rezolve(eachB);
													} else if (oldB == bb2.length) {
														// console.log(".");
														rezolve(eachB);
													} else {
														// console.log("\\");
														rezolve(eachB);
													}
												});
											} else {
												rezolve(eachB);
											}
										});
									});
									return (mapped);
								}).catch((e) => { });
							// return Promise.resolve(mapped);
						})
						.then(builtResults => {
							Promise.all(builtResults)
								.then((builtRez) => {
									res.json(builtRez);
									storeBusinesses(builtRez);
								})
								.catch((e) => { });
							// res.json(builtResults);
							// storeBusinesses(builtResults);
						})
						.catch(e => { console.log(e + " all books error"); });
						 */
				} catch (e) { console.error(e); }
			});
		});
		sreq.on('error', (e) => {
			console.error(`problem with request: ${e.message}`);
		});
		sreq.end();
	}//allBooks function

	//accepts JSON array of yelp businesses, then outputs JSON for client
	function pinBuilder(result, opts, single) {
		return new Promise((resolve, reject) => {
			console.log("pinBuilder callback");

			if (!Array.isArray(result) && single == false) {
				console.log(result);
				reject("input not an array");
			} else {
				//array not expected, insert single obj into array
				let tmpArray = []
				if (single == true) {
					//insert single object into array space
					tmpArray.push(result);
				} else {
					//use original array as tmpArray
					tmpArray = result;
				}
				var aggregator = [];
				var currentBook = ""; var currentPIndex = -1;
				var totalVotes = 0;
				var vRay = [];

				if (opts) { console.log(opts); }
				function findISBN(thisBook) {
					return new Promise((resolv, rejec) => {
						try {
							console.log(thisBook);
							let single = [];
							if (thisBook.hasOwnProperty("isbn13")) {
								resolv((thisBook.isbn13));
							} else
								if (thisBook.hasOwnProperty("volumeInfo")) {
									let idArr = thisBook["volumeInfo"];
									let indArr = Array.from(idArr["industryIdentifiers"]);
									single = indArr.filter((ident) =>
										ident.type == "ISBN_13"
									);
									resolv((single[0]["identifier"]));
								} else
									if (thisBook.hasOwnProperty("id")) {
										resolv((thisBook.id));
									} else {
										rejec(false);
									}
						} catch (e) { if (e instanceof TypeError) { resolv("N/A") } }
					});
				}
				let finalProm = tmpArray.map((value, index) => {
					return new Promise((resolve, reject) => {
						//return back to the mapping
						return findISBN(value)
						.then((isbnFound) => {
							console.log("inside return isbn");
							let book = value;
							// try {
								//dummy object "volumeInfo" if it is not included in Google API response
								let volDummy = book.volumeInfo || {
									title: "not found",
									authors: "not found",
									pageCount: "not found",
									imageLinks: "not found",
									language: "not found",
									infoLink: "not found"									
								};
								let bookTitle = book.title || volDummy.title;
								let bookAuthors = book.authors || volDummy.authors;
								let bookPublishedDate = book.publisheddate || volDummy["publishedDate"];
								let bookPages = book.pages || volDummy.pageCount;
								let imageLinks = volDummy.imageLinks || 
									{ thumbnail:	"no thumbnail" };
								let bookImageUrl = book["image_url"] || imageLinks.thumbnail;
								let bookLanguage = book.language || volDummy.language;
								let bookUrl = book.url || volDummy.infoLink;
								let bookJson = JSON.stringify(book) || "";
								let bookId = book.volume || book.id || null;
								resolve({
									id: bookId, //id as volume id
									title: bookTitle,
									authors: bookAuthors,
									publishedDate: bookPublishedDate,
									isbn13: isbnFound,
									pages: bookPages,
									image_url: bookImageUrl,
									language: bookLanguage,
									url: bookUrl,
									json_string: bookJson
								})
							/* } catch (error) {
								if (error instanceof TypeError) {
									//reject the object
									resolve(false);
								}
								else {
									reject(error);
								}
							}//caught error */

						}).catch((e) => { console.log(e) });
					});
				})
				Promise.all(finalProm)
					.then(wholeArray => {
						return Promise.resolve(
							wholeArray.filter((v) => v !== false)
						);
					})
					.then((filtered) => {
						resolve(filtered);
					})
					.catch((e) => {
						reject(e);
					});
				// resolve(aggregator);
			}//passes "array" test
		});
	}//pinBuilder
	
	//answers seach queries for pins (with or without search terms)
	this.ourPins = function (req, res) {
		 //optional parameter "exclusion=user" to exclude "her own pins" from results
		console.log('handler.server.js.ourPins');
		var pool = new pg.Pool(config);

		function queryMaker(exclTest) {
			return new Promise((resolve, reject) => {
				const values = [];
				var terms = req.query.terms;
				var tsQuery;

				 //check if query has specific ownership id...
				var findOne = req.query["FINDUSER"];				

				if(findOne && findOne.length > 0){
					var reqId = req.user.id || null;
					
					console.log("finding single user's pins... " + findOne);
					//find one	
					let text = returnText(" AND ownership.owner = $2");
					//exclude user check not needed
					resolve([text, [reqId, findOne]]);	
				}		 
						
				//check if query has terms (or not = find all books)
				if (terms.length > 0 && terms.length < 200) {
					console.log("terms found: " + req.query.terms);
					let tsSplit = terms.split(/[ ,]+/);
					tsQuery = tsSplit.join(" & ");
					let text = returnText(" AND  tsv @@ to_tsquery($2) ");
					let userCheck = req.user || false; //user logged in?
					if (userCheck !== false) {
						let userId = req.user.id || "";
						resolve([text, [userId, tsQuery]]);
					} else { //not logged in						
						resolve([text, ["", tsQuery]]);
					}
				}//if, search terms present
				else {
					//find all	
					let text = returnText("  ");
					let userCheck = req.user || false; //user logged in?
					if (userCheck !== false) {
						let userId = req.user.id || "";
						//empty string for owner id (array[0])
						resolve([text, [ userId]]);
						//user is not logged in, then we can't exclude userid
					} else {
						//empty string for owner id (array[0])
						resolve([text, ["dummy_id"]]);
					}//else, not excluding					
				}//else, no search terms
				function returnText(optQuery) {
					let tmpText = 'SELECT pins.title, pins.href, pins.image_url, pins.url, pins.active, pins.origindate, pins.volume, pins.tags, pins.lastchecked, pins.size, pins.fformat' +
					', COUNT(*) filter (WHERE likes.active = true) AS pinned_count ' +
					', COUNT(*) filter (WHERE( likes.userliking = $1) AND ( likes.active = true)) AS self_likes' +
					', COUNT(*) filter (where (ownership.owner = $1) ) AS owned_pin ' +
					 ', users.image_url AS userimg, users.id AS userlink ' +
					' FROM ownership LEFT OUTER JOIN pins ON ownership.pinid = pins.volume ' +
					' LEFT OUTER JOIN users ON ownership.owner = users.id ' +
					' LEFT OUTER JOIN likes ON likes.likedpin = ownership.pinid ' +					
					' WHERE ownership.active = true AND pins.active = true ' + optQuery;

					// ' NOT likes.active = false AND ';
					/* let tmpText = 'SELECT pins.title, pins.href, pins.image_url, pins.url, pins.active, pins.origindate, pins.volume, pins.tags, pins.lastchecked, pins.size, pins.fformat' +
						', COUNT(*) filter (WHERE likes.active = true) AS pinned_count ' +
						', COUNT(*) filter (WHERE( likes.userliking = $1) AND ( likes.active = true)) AS self_likes' +
						', COUNT(*) filter (where (ownership.owner = $1) ) AS owned_pin ' +
						// ', users.image_url AS ownerimg' +
						' FROM pins LEFT OUTER JOIN likes ON pins.volume = likes.likedpin ' +
						' LEFT OUTER JOIN ownership ON ownership.pinid = pins.volume ' +
						// ' LEFT JOIN users ON ownership.owner = users.id ' +
						' WHERE ownership.active = true ' + optQuery;
						// ' NOT likes.active = false AND '; */
					return tmpText.concat(" GROUP BY volume, users.image_url, users.id");
				}//returnText fn
			});
		}
		//does user want "her own pins" exluded?
		var exclusion = req.query.exclude || false;

		queryMaker(exclusion).then((textArray) => {
			var text = textArray[0];
			// console.log(text);	
			var values = textArray[1];
			// console.log(values);
			pool.connect()
				.then(client => {
					// console.log('pg-connected: getPins')
					client.query(text, values, function (err, result) {
						if (err) {
							res.status(403);
							console.log(err);
							console.log("get pins error");
							res.json({ pinsFound: "none" });
						}
						let rc = result.rowCount;
						client.release();
						if (rc == 0) {
							res.status(200);
							res.json({ pinsFound: "none" });
						} else {
							console.log(JSON.stringify(result).substring(0,100));
							/* bookBuilder(result.rows, false)
								.then(builtBooks => {
									console.log("built books: " + builtBooks);
									res.json(builtBooks);
								})
								.catch(e => { console.log(e + "loopy Loop"); });
							 */
							res.json(result.rows);
							
							 /* const promiseSerial = funcs =>
									funcs.reduce((promise, func) =>
										promise.then(result => func().then(Array.prototype.concat.bind(result))),
										Promise.resolve([])
									);
								// convert each url to a function that returns a promise
								const funcs = result.rows.filter(rowCheck => rowCheck).map(
									pgResp => () => yelpSingle(pgResp, null)
								);
	
								promiseSerial(funcs)
									.then(promies => (bookBuilder(promies, true)))
									.then(builtBooks => {
										res.json(builtBooks);
										// console.log("builtBarsVVVV");							
									})
									.catch(e => { console.log(e + "loopy Loop"); });
							*/
						}
					});
				})
				.catch(err => console.error('error connecting', err.stack))
				.then(() => pool.end());
		})
			.catch(err => console.error('error ourPins', err.stack))

		//requests single business data from yelp api,
		//TODO qps on a timer
		function yelpSingle(appt, options) {
			/***	appt object:				
				timestamp	
				userid	
				yelpid	
				location	
				active
				_id			*/
			return new Promise((resolve, reject) => {

				var queryData = querystring.escape(appt.yelpid);

				console.log("query data is:   " + queryData);

				var bodyJSON;
				var options = {
					hostname: 'api.yelp.com',
					port: 443,
					path: ('/v3/businesses/' + queryData),
					method: 'GET',
					headers: {
						'Authorization': ('Bearer ' + process.env.API_KEY),
						'user-agent': 'clclarkFCC/1.0',
						'Accept-Language': 'en-US',
					},
					timeout: 4000
				};
				const yreq = https.request(options, (resf) => {
					var body1 = [];
					console.log(`STATUS: ${res.statusCode}` + "yelp Single");
					// console.log(`HEADERS: ${JSON.stringify(resf.headers)}`);					
					if (resf.headers["content-type"] == "application/json") {

						resf.on('data', (d) => {
							body1.push(d);
						});
						resf.on('end', () => {
							try {
								// console.log(body1);
								// console.log("pre-parse");
								let bodyJSON = JSON.parse(Buffer.concat(body1).toString());
								// console.log(">>>>post-parse");
								//add original appointment data
								bodyJSON["appt"] = appt;

								// console.log(JSON.stringify(bodyJSON).substring(0, 20));
								// console.log("json body rec'd ***************");

								resolve(bodyJSON);
							} catch (e) { console.error(e.message); reject(e); }
						});
					}//if content type
					else {
						resf.on('data', (d) => {
							process.stdout.write(d);
						});
						resf.on('end', () => {
							reject("not json");
						});
					}
				});
				yreq.on('timeout', (e) => {
					console.error(`request timeout: ${e.message}`);
					yreq.abort();
					//resolve empty object
					resolve({});
				});
				yreq.on('error', (e) => { console.error(`problem with request: ${e.message}`); reject(e); });
				yreq.end();
			});//promise		
		}//yelpSingle		
	}//ourBooks

	/***************************************** */
	this.myPins = function (req, res) {
		var pool = new pg.Pool(config);
		function queryMaker() {
			return new Promise((resolve, reject) => {

				let text = 'SELECT pins.title, pins.href, pins.image_url, pins.url, pins.active, pins.origindate, pins.volume, pins.tags, pins.lastchecked, pins.size, pins.fformat' +
					', COUNT(*) filter (WHERE likes.active = true) AS pinned_count ' +
					', COUNT(*) filter (WHERE( likes.userliking = $1) AND ( likes.active = true)) AS self_likes' +
					', COUNT(*) filter (where (ownership.owner = $1) ) AS owned_pin ' +
					' FROM pins LEFT OUTER JOIN likes ON pins.volume = likes.likedpin ' +
					' LEFT OUTER JOIN ownership ON ownership.pinid = pins.volume ' +
					' WHERE likes.userliking = $1 ' +
					' AND ownership.active = true AND pins.active = true' +
					' AND NOT likes.active = false GROUP BY volume';

				const values = [];
				var uid = req.user.id;
				values.push(uid);

				resolve([text, values]);
			});
		}
		//more code here?

		queryMaker().then((textArray) => {
			var text = textArray[0];
			// console.log(text);	
			var values = textArray[1];
			// console.log(values);
			pool.connect()
				.then(client => {
					// console.log('pg-connected: getBooks')
					client.query(text, values, function (err, result) {
						if (err) {
							res.status(403);
							console.log(err);
							console.log("get pins error");
						}
						else {
							let rc;
							if (Array.isArray(result.rows)) {
								rc = result.rowCount;
							}
							else {
								rc = 0;
							}
							client.release();
							if (rc == 0) {
								res.status(200);
								res.json({ pinsFound: "none" });
							} else {
								console.log(JSON.stringify(result.rows));
								res.json(result["rows"]);	
							}
						}//else no error
					});
				})
				.catch(err => console.error('error connecting', err.stack))
				.then(() => pool.end());
		});

	}//myBooks
	/***************************************** */
	this.addMyPin = function (req, res) {
		// https://www.googleapis.com/books/v1/volumes/volumeId

		console.log('addMyPin callback');
		var userId = new String(req.user.id).substring(0, 140) || null; //arbitrary cut off
		var options;
		//TODO: fix tags based on client format
								
		let rawTags = req.query.tags;
		let tagArr = rawTags.split("+");
		console.log(JSON.stringify(tagArr));
		let tArrStr = JSON.stringify(tagArr);

		var tagsToo = ('{' + JSON.stringify(tagArr).substring(1,(tArrStr.length-1)) + '}');
		console.log(tagsToo);			

		if (req.query.link !== null && req.query.link !== "undefined") {
			//1 get the link [and tags?]
			var volId = new String(req.query.volume).substring(0, 20) || null;
			var linkId = url.parse(querystring.unescape(new String(req.query.link).substring(0, 500))) || null;
			linkId.protocol = 'https:';
			//save to session...
			req.session.lastPinned = linkId.href;
			//2 query the link for response (check if image)
			// console.log(linkId);	//testing					
			options = {
				hostname: linkId.hostname,
				// port: linkId.port, //require https port
				port: 443,
				path: (linkId.pathname),
				method: 'GET',
				headers: {
					'user-agent': 'clclarkFCC/1.0',
					'Accept-Language': 'en-US',
					'Connection': 'keep-alive'
				}
			}; //options
		}// if : link present

		processAPICallPlusDB();
		// res.sendStatus(200); //testing	

		function processAPICallPlusDB(){
			const sreq = https.request(options, (res2) => {
				var body1 = [];
				var contentType = res2.headers["content-type"];
				console.log(`STATUS: ${res2.statusCode}`);
				console.log(`HEADERS: ${JSON.stringify(res2.headers)}`);	
				console.log(`CONTENT-TYPE: ${JSON.stringify(res2.headers["content-type"])}`);							
				res2.on('data', (d) => {
					body1.push(d);					
				});
				res2.on('end', () => { // console.log(body1); 
					console.log(Buffer.concat(body1).toString("utf8", 0, 4));
					if (contentType.substring(0, 5) == "image") {						
						//passes the image check
						//>insert into database
						try {
							// title, volume, href,tags,origindate,image_url,url,active
							let today = new Date(Date.now());
							insertMyPin({
								title: linkId.href,
								href: linkId.href,
								tags: tagsToo,
								origindate: today.toISOString(),
								lastchecked: res2.headers["date"] || null,
								image_url: linkId.href,
								url: linkId.href,
								active: true
							})
								.then((insertResult) => {
									console.log("insert result: " + insertResult)
									return updateOwnership(req, insertResult[0], true)
								})
								.then((updateRes) => {
									res.json(updateRes);
								}).catch((e) => { console.log(e); })
						} catch (e) { console.error(e); res.sendStatus(404); }
					} else { //the image did not respond properly...
						try {
							// title, volume, href,tags,origindate,image_url,url,active
							let today = new Date(Date.now());
							insertMyPin({
								title: linkId.href,
								href: '/img/ph.png',
								tags: (tagsToo + 'error'),
								origindate: today.toISOString(),
								lastchecked: res2.headers["date"] || null,
								image_url: '/img/ph.png',
								url: linkId.href,
								active: true
							})
								.then((insertResult) => {
									console.log("insert result: " + insertResult)
									return updateOwnership(req, insertResult[0], true)
								})
								.then((updateRes) => {
									res.json(updateRes);
								}).catch((e) => { console.log(e); })

						} catch (e) { console.error(e); res.sendStatus(404); }
					}//else image not correct
				});
			});
			sreq.on('error', (e) => {
				console.error(`problem with request: ${e.message}`);
				res.sendStatus(404); 
			});
			sreq.end();

			//access postgres db
			function insertMyPin(book) {
				// console.log(JSON.stringify(book));
				return new Promise((resolve, reject) => {
					const insertText =
						'INSERT INTO public.pins ("title", "href","tags","origindate","image_url","url", "lastchecked", "active") ' +
						'VALUES($1, $2, $3, $4, $5, $6, $7, $8) ' +
						' ON CONFLICT (href) DO UPDATE SET title = EXCLUDED.title ' +
						' RETURNING (title, href,tags,origindate,image_url,url,lastchecked,active), volume AS pinid';
					const insertValues = [];
					try {
						let bt = book.title || "";						
						let bhref = book.href || "";
						let bauth = book.tags || "{None}";
						let bpd = book["origindate"] || "";						
						let bimg = book["image_url"] || "";					
						let burl = book.url || "";
						let bchecked = book.lastchecked || "";

						insertValues.push(bt);
						insertValues.push(bhref);
						insertValues.push((bauth)); //tags
						insertValues.push((bpd)); //origindate				
						insertValues.push((bimg));				
						insertValues.push((burl));		
						insertValues.push((bchecked));						
						insertValues.push(true);
						/* do {
							insertValues.push('{null}'); //ensure length
						} while (insertValues.length 11 9); */
						function pushSafe(content) {
							if (content !== null) {
								return content;
							} else {
								return "null";
							}
						}//pushSafe
					} catch (error) { console.log(error); }

					//new postgresql connection
					var poolz3 = new pg.Pool(config);
					poolz3.connect()
						.then(client2 => {
							// console.log('pg-connected2');
							client2.query(insertText, insertValues, function (err, result) {
								client2.release();
								if (err) {
									console.log("REJECTED" + err); reject(err);
								} else {
									console.log("insertBook result: " + JSON.stringify(result));
									resolve(result.rows);
								}//else
							});//client.query
						})
						.catch(err => console.error('error connecting2', err.stack))
						.then(() => poolz3.end());
				});//insertPromise				
			}//insertMyBook fn
		}					
	}//this.addMyBook

	/**
	 * access postgres db, provide book data, pg pool, + "add or remove"
	 * @param {Object} bookData 
	 * @param {PG pool Object} exPool 
	 * @param {boolean} change 
	 */
	function updateOwnership(req, bookData, change) {
		return new Promise((resolve, reject) => {
			var insertText;
			const insertValues = [];
			let userid = req.user.id;
			let active;
			if (change == true) {
				//add operation
				active = change;
				insertText =
					//id is generated by postgres; "dateRemoved" not used
					'INSERT INTO public.ownership ("owner","pinid","date_added","active") ' +
					'VALUES($1, $2, $3, $4) ' +
					'ON CONFLICT (owner, pinid) WHERE active = false DO UPDATE SET active = true ' +
					'RETURNING *';

			} else if (change == false) {
				//remove operation
				active = change;
				insertText =
					//id is generated by postgres; "dateAdded" not used
					'INSERT INTO public.ownership ("owner","pinid","date_removed","active") ' +
					'VALUES($1, $2, $3, $4) ' +
					'ON CONFLICT (owner, pinid) DO NOTHING ' +
					'RETURNING *';
					
			}
			if (userid !== null && userid !== undefined) {
				try {
					let today = new Date(Date.now());
					insertValues.push(userid); //owner id
					insertValues.push(bookData.pinid); //book id
					insertValues.push(today.toISOString()); //dateAdded					
					insertValues.push(active);
					function pushSafe(content) {
						if (content !== null) { return content; } else { return "null"; }
					}//pushSafe
				} catch (error) { console.log("ownership try err: " + error); }
				//new postgresql connection
				var exPool = new pg.Pool(config);
				exPool.connect()
					.then(client2 => {
						// console.log('pg-connected2');
						client2.query(insertText, insertValues, function (err, result) {
							client2.release();
							if (err) {
								console.log("ownership query err: " + err); reject(err);
							} else {
								console.log("ownership result: " + JSON.stringify(result));
								resolve(result);
							}//else
						});//client.query
					})
					.then(() => { exPool.end(); })
					.catch(err => console.error('error connectingZ', err.stack))
				//end pool in parent function					
			}
		});//promise return
	}//updateOwnership
	/***************************************** */
	this.removeMyPin = function (req, res) {
		console.log('removeMyPin callback');
		var userId = new String(req.user.id).substring(0, 140).trim() || null; //arbitrary cut off

		if (req.query.volume !== null && req.query.volume !== "undefined") {
			//1 get the book ID
			var volId = new String(req.query.pinid).substring(0, 36) || null;
			removeFromDB(userId, volId)
			.then(() => {
				res.json({status: "Successful remove"});
			}).catch((e) => {
				console.log(e);
				res.json({status: "Error in removal"});
			});
		}

		//TODO: update any trades... cancel them in postgres when book removed
		
		//access postgres db
		function removeFromDB(user, book) {
			return new Promise((resolve, reject) => {
				const insertText =
					// 'INSERT INTO public.ownership ("owner","bookid","date_added","date_removed","active") ' +
					// 'VALUES($1, $2, $3, $4, $5, $6) ' 
					'UPDATE public.ownership ' +
					' SET active = false, date_removed = $3 ' +					
					//  ' ON CONFLICT ("bookisbn")' +
					' WHERE ownership.owner = $1 AND ownership.pinid = $2 RETURNING *';
				const insertValues = [];
				try {															
					insertValues.push(userId); //owner/userid from authenticated user
					insertValues.push(book); //book ownership uuid... 
					let today = new Date(Date.now());			
					insertValues.push(today.toISOString()); //dateAdded	
				} catch (error) { console.log(error); }

					console.log(insertText)
					console.log(insertValues)
				//new postgresql connection
				var poolz3 = new pg.Pool(config);
				poolz3.connect()
					.then(client2 => {
						// console.log('pg-connected2');
						client2.query(insertText, insertValues, function (err, result) {
							client2.release();
							if (err) {
								console.log("REJECTED" + err); reject(err);
							} else {
								console.log("removeBook result: " + JSON.stringify(result));
								resolve(result.rows);
							}//else
						});//client.query
					})
					.catch(err => console.error('error connecting2', err.stack))
					.then(() => poolz3.end());
			});
		}//removeMyBook fn
	}//removeMyBook
	/***************************************** */		

	//pin if not pinned, unpin if pinned
	this.likeSwitch = function (req, res) {

		var onOff; //set the function to activate "like" or deactivate
		if(req.query.switch == "false"){
			onOff = false;
		}else{
			onOff = true;
		}
		updatePin(onOff).then((qRes) => {
			let resJson = {
				pinStatus: qRes["rows"][0]["active"], 
				pinHref: qRes["rows"][0]["href"], 
				pinId: qRes["rows"][0]["volume"]
			};
			res.json(resJson);
			// res.sendStatus(200);	
		})
		.catch((e) => {			
			console.log(e);
			res.sendStatus(404);
		});

		function updatePin (polarity) {
			return new Promise((resolve, reject) => {
				let pinToSwitch = req.query.pinid;
				let userid = req.user.id;
				var active = polarity;
				// if(polarity == false){
				// 	active = polarity;
				// }else{
				// 	active = true;
				// }					
				var insertText;
				const insertValues = [];
				insertText =
					/* //id is generated by postgres; "dateRemoved" not used
						'INSERT INTO public.ownership ("owner","pinid","date_added","active") ' +
						'VALUES($1, $2, $3, $4) ' +
						// 'ON CONFLICT (owner, pinid) DO UPDATE SET active = NOT COALESCE(EXCLUDED.active) ' +
						'ON CONFLICT (owner, pinid) DO UPDATE SET active = (EXCLUDED.active) ' +
						'RETURNING *';
					 */
					'INSERT INTO public.likes ("userliking","likedpin","likeddate","active") ' +
					'VALUES($1, $2, $3, $4) ' +
					'ON CONFLICT (userliking, likedpin) DO UPDATE SET active = (EXCLUDED.active) ' +
					'RETURNING *';
					
					 if (userid !== null && userid !== undefined) {
					try {
						let today = new Date(Date.now());
						insertValues.push(userid); //owner id
						insertValues.push(pinToSwitch); //book id
						insertValues.push(today.toISOString()); //dateAdded					
						insertValues.push(active);
						function pushSafe(content) {
							if (content !== null) { return content; } else { return "null"; }
						}//pushSafe
					} catch (error) { console.log("ownership try err: " + error); }
					//new postgresql connection
					var exPool = new pg.Pool(config);
					exPool.connect()
						.then(client2 => {
							// console.log('pg-connected2');
							client2.query(insertText, insertValues, function (err, result) {
								client2.release();
								if (err) {
									console.log("ownership query err: " + err); reject(err);
								} else {
									console.log("ownership result: " + JSON.stringify(result));
									resolve(result);
								}//else
							});//client.query
						})
						.then(() => { exPool.end(); })
						.catch(err => console.error('error connectingZ', err.stack))
					//end pool in parent function					
				}
			}); //promise
		}

	}
	
	//simple update for the owner column
	function updateOwner(newOwner, ownershipId) {
		return new Promise((resolve, reject) => {
			const insertText =			
				'UPDATE public.ownership ' +
				' SET tradeable = $3, owner = $1 ' +
				//  ' ON CONFLICT ("bookisbn")' +
				' WHERE ownership.id = $2 ' +
				' RETURNING *';
			const insertValues = [];
			try {
				insertValues.push(newOwner); //new owner id
				insertValues.push(ownershipId); //ownership id
				insertValues.push(true); //tradeable, true or false
			} catch (error) { console.log(error); }
			console.log(insertText)
			console.log(insertValues)
			//new postgresql connection
			var poolz3 = new pg.Pool(config);
			poolz3.connect()
				.then(client2 => {
					// console.log('pg-connected2');
					client2.query(insertText, insertValues, function (err, result) {
						client2.release();
						if (err) {
							console.log("REJECTED" + err); reject(err);
						} else {
							console.log("updateOwner result: " + JSON.stringify(result.rows));
							resolve(result.rows);
						}//else
					});//client.query
				})
				.catch(err => console.error('error connecting update owner', err.stack))
				.then(() => poolz3.end());
		}); //promise
	}//updateOwner
		
	
}//PinsHandler

module.exports = PinsHandler;
