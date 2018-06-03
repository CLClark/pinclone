'use strict';

var TRADES = TRADES || (function () {
	var _args = {}; // private
	var functionCB;
	var formerCB;
	var resultCB;
	var arg3;
	var thirdCB;
	return {
		init: function (Args) {
			_args = Args;
			// some other initialising
			functionCB = _args[0];
			resultCB = _args[1];
			arg3 = _args[2];
		},//init

		myBookForm: function () {
			return new Promise((resolve, reject) => {
				//query to find my book
				var yelper = new Event('bookApi');
				// Listen for the event.
				var staticText = document.querySelector('#poll-view') || null;
				if (staticText !== null) {
					document.querySelector('#poll-view').addEventListener('bookApi', function (e) {
						this.innerHTML = "now finding, Please hold...";
					}, false);
				}
				document.querySelector('input#probook').addEventListener("keypress", function (e) {
					var key = e.which || e.keyCode;
					var i = document.querySelector('#probook').value;
					if (key === 13) { // 13 is enter					
						// code for enter
						console.log("fired probook input: " + i);
						let userInput = i.toUpperCase();
						var reg = new RegExp('^\S{0,50}$'); //search term less than 50				
						// if (reg.test(i)) {

						//execute the GET
						bookFind(userInput);

						/* handle gui (tab)	 */
						// tabColourer("search-club");
						// document.querySelector('#probook').value = "";
						// Dispatch "results" loading event
						document.querySelector('#poll-view').dispatchEvent(yelper);
						// }
					}

					function bookFind(searchValue) {
						var request = ('/my-books/?terms=' + searchValue + '&exclude=untradable');// + "&timeframe=" + timeFrame.toISOString());
						ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', request, 7000, function (err, data, status) {
							if (err) {
								console.log("request error")
							} else {
								document.querySelector('#poll-view').innerHTML = "";
								var booksFound = JSON.parse(data);
								console.log(booksFound);

								functionCB(booksFound, 'poll-view', { classText: " my-book-sup" }, resultCB);
							}
							/* 
								//barFormer callback
								functionCB(barsFound, 'poll-view', null, null);
								passedInFunction();
								//					formerCB();
							*/
						}));
					};

					function tabColourer(selectedTab) {
						let tabs = document.querySelectorAll(".navicon");
						tabs.forEach((thisTab) => {
							thisTab.setAttribute("style", "opacity: .7");
						});
						let fullOpacity = document.querySelector(("#") + selectedTab);
						if (fullOpacity !== null) {
							fullOpacity.setAttribute("style", "");
						}
					}
				});

			}); //prom			
		},//myBookForm

		reqBookForm: function () {
			return new Promise((resolve, reject) => {
				//query to find my book
				var yelper = new Event('bookApi');
				// Listen for the event.
				var staticText = document.querySelector('#poll-view-request') || null;
				if (staticText !== null) {
					document.querySelector('#poll-view-request').addEventListener('bookApi', function (e) {
						this.innerHTML = "now finding, Please hold...";
					}, false);
				}
				document.querySelector('input#reqbook').addEventListener("keypress", function (e) {
					var key = e.which || e.keyCode;
					var i = document.querySelector('#reqbook').value;
					if (key === 13) { // 13 is enter					
						// code for enter
						console.log("fired probook input: " + i);
						let userInput = i.toUpperCase();
						var reg = new RegExp('^\S{0,50}$'); //search term less than 50				
						// if (reg.test(i)) {

						//execute the GET
						bookFind(userInput);

						/* handle gui (tab)	 */
						// tabColourer("search-club");
						// document.querySelector('#reqbook').value = "";
						// Dispatch "results" loading event
						document.querySelector('#poll-view-request').dispatchEvent(yelper);
						// }
					}

					function bookFind(searchValue) {
						/*  date not needed in book app
							let tDay = new Date();
							let timeFrame = new Date(tDay.getFullYear(), tDay.getMonth(), tDay.getDate())
							if (tDay.getHours() >= 20) {
								timeFrame.setDate(timeFrame.getDate() + 1);
							}
						*/
						//exclude the user in query parameters (don't want user to request their own book)
						var request = ('/club/?terms=' + searchValue + '&exclude=user');// + "&timeframe=" + timeFrame.toISOString());
						ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', request, 7000, function (err, data, status) {
							if (err) {
								console.log("request error")
							} else {
								document.querySelector('#poll-view-request').innerHTML = "";
								var booksFound = JSON.parse(data);
								console.log(booksFound);

								functionCB(booksFound, 'poll-view-request', { classText: " req-book-sup" }, resultCB);
							}
							/* 
								//barFormer callback
								functionCB(barsFound, 'poll-view', null, null);
								passedInFunction();
								//					formerCB();
							*/
						}));
					};

					function tabColourer(selectedTab) {
						let tabs = document.querySelectorAll(".navicon");
						tabs.forEach((thisTab) => {
							thisTab.setAttribute("style", "opacity: .7");
						});
						let fullOpacity = document.querySelector(("#") + selectedTab);
						if (fullOpacity !== null) {
							fullOpacity.setAttribute("style", "");
						}
					}
				});

			}); //prom			
		}, //reqBookForm

		//add "choose" functionality to results
		resHandler: function () {
			let resList = document.querySelectorAll(".poll-view-list .poll-wrap-sup");
			resList.forEach((bookRes) => {
				if (bookRes.getAttribute("listener") !== "true") {
					var side;
					if (bookRes.classList.contains("req-book-sup")) {
						side = "left";
					} else {
						side = "right";
					}
					bookRes.addEventListener("click", pickFunction.bind(bookRes, side), false);
					bookRes.setAttribute("listener", "true");
				}
			});

			function pickFunction(tradeSide) {
				var formSide;
				var resultSide;
				var sideId;
				var formInput;
				var sectionTitle;

				if (tradeSide == "right") {
					formSide = "#right-book";
					resultSide = "#poll-view";
					sideId = "prop-wrap";
					formInput = "#propinput";
					sectionTitle = "#proposed-title";
				} else {
					formSide = "#left-book";
					resultSide = "#poll-view-request";
					sideId = "req-wrap";
					formInput = "#reqinput";
					sectionTitle = "#requested-title";
				}

				let that = this;

				let leftB = document.querySelector(formSide); //variable
				let currentBook = leftB.querySelector(".poll-wrap-sup");
				let resultList = document.querySelector(resultSide);	//variable
				let formField = document.querySelector(formInput); //var				

				//add book back to results list
				if (currentBook !== null && currentBook.id !== "wrap-null") { //variable?									
					currentBook.id = currentBook.getAttribute("tempid");
					currentBook.setAttribute("listener", "true");
					resultList.appendChild(currentBook); //variable?							
				} else if (currentBook.id == "wrap-null") {
					leftB.removeChild(currentBook); //variable?
				}
				//update form input	
				var dataDiv = that.querySelector(".poll-view-list-poll");
				if (dataDiv != null) {
					var bookJson = JSON.parse(dataDiv.getAttribute("book-data"));
					formField.setAttribute("value", bookJson.id);
					// console.log(bookJson.id); //testing
				}
				//replace gui element (book)
				that.setAttribute("tempid", that.id);
				that.id = sideId; //variable				
				if (leftB.childElementCount < 3) {
					//place chosen book in form
					leftB.appendChild(that);
				}
				//update gui title
				let secTitle = document.querySelector(sectionTitle);
				secTitle.innerHTML = that.querySelector(".poll-title").innerHTML;

				//set listener flag
				that.setAttribute("listener", "false");

				//req-wrap
				//prop-wrap

			}//pickFunction

		},//resHandler

		//dynamic script based on page path
		sufInit: function () {
			// console.log(window.location); //testing
			if (window.location.search == "") {
				//new trade
			} else {
				//existing trade
				document.querySelector("#tradefrm2").setAttribute("style", "display: none");
			}//else

			//accept, reject, cancel
			function acceptIt(tradeIdentifier, tradeAction) {
				console.log(tradeAction + " trade");
				let apiLink = "/trade-response?" + "trade=" + tradeIdentifier + "&action=" + tradeAction;
				ajaxFunctions.ready(ajaxFunctions.ajaxRequest('POST', apiLink, 8000, function (err, data, status) {
					if (err) { console.log(err); }
					else {
						//handle successful  response
						console.log(data);
						//reload the trade page...
						location.reload();
					}//else
				}));//ajaxRequest
			}//acceptIt

			//TODO edit trade, supply changes to the server
			function editIt() {
				console.log("edited trade");
			}//editIt

			//creates accept, reject buttons
			function responseMaker(statusResp) {
				//append to document
				let placeToPut = document.querySelector("#tradefrm");
				//what is status of trade...  conditional responses				
				if (statusResp == "accept-reject") {
					//accept
					let respBtn = document.createElement("div");
					respBtn.id = "trades-navi-accept";
					respBtn.setAttribute("class", "btn trades-navi-trade-new");
					respBtn.innerHTML = "Accept Trade";
					//reject
					let rejBtn = document.createElement("div");
					rejBtn.id = "trades-navi-reject";
					rejBtn.setAttribute("class", "btn trades-navi-trade");
					rejBtn.innerHTML = "Reject Trade";
					if (placeToPut !== null) {
						function appendButton(whichBtn) {
							return new Promise((resolve, reject) => {
								resolve( placeToPut.appendChild(whichBtn)); 								
							});
						}
						let accRejArr = [appendButton(rejBtn), appendButton(respBtn)]; 
						//add buttons, then add listeners
						Promise.all(accRejArr).then(
							() => {
								//add event listeners
								//accept
								let respB = document.querySelector("#trades-navi-accept");
								if (respB !== null) {
									//TODO move this  into scope of "exists" condition code... tradeId
									respB.addEventListener("click", acceptIt.bind(respB, tradeId, "accept"));
								}
								//reject
								let rejB = document.querySelector("#trades-navi-reject");
								if (rejB !== null) {
									rejB.addEventListener("click", acceptIt.bind(rejB, tradeId, "reject"));
								}
							}
						).catch((e) => { console.log(e); });
					} else {
						reject("no tradefrm element found");
					}//else tradefrm
				} else if (statusResp == "completed") {
					//do nothing special
					resolve();
					console.log("no buttons added");
				} else if (statusResp == "pending") {
					//cancel
					let cancBtn = document.createElement("div");
					cancBtn.id = "trades-navi-cancel";
					cancBtn.setAttribute("class", "btn trades-navi-trade");
					cancBtn.innerHTML = "Cancel Trade";
					//edit
					let editBtn = document.createElement("div");
					editBtn.id = "trades-navi-edit";
					editBtn.setAttribute("class", "btn trades-navi-trade-edit");
					editBtn.innerHTML = "Edit Trade";
					//add the cancel and edit buttons
					placeToPut.appendChild(cancBtn);
					placeToPut.appendChild(editBtn);
					if (placeToPut !== null) {
						function appendButton(whichBtn) {
							return new Promise((resolve, reject) => {
								resolve(placeToPut.appendChild(whichBtn));
							});
						}
						let accRejArr = [appendButton(cancBtn), appendButton(editBtn)];
						//add buttons, then add listeners
						Promise.all(accRejArr).then(
							() => {
								//add event listeners
								//cancel
								let cancB = document.querySelector("#trades-navi-cancel");
								if (cancB !== null) {
									cancB.addEventListener("click", acceptIt.bind(cancB, tradeId, "cancel"));
								}
								//edit
								let editB = document.querySelector("#trades-navi-edit");
								if (editB !== null) {
									editB.addEventListener("click", editIt);
								}
							}
						).catch((e) => { console.log(e); });
					} else {
						reject("no tradefrm element found");
					}//else tradefrm
				}//else pending
			}//responseMaker

			//parse window URL for a trade id
			let tradeId = window.location.search.split("=")[1];
			if (tradeId.length == 36) {
				//get the trade data from the id
				queryServer(tradeId)
					.then((foundTrade) => {
						console.log(foundTrade);
						var tradeStatus = foundTrade["status"];
						var tradeIdSpace = document.querySelector("#trade-id");
						if (tradeIdSpace !== null) {
							tradeIdSpace.innerHTML = foundTrade["id"];
						}
						var tradeStat = document.querySelector("#trade-status");
						if (tradeStat !== null) {
							tradeStat.innerHTML = tradeStatus;
						}
						//handle trade status buttons
						if (tradeStatus.toLowerCase() == "pending") {
							//allow proposer to edit or cancel(withdraw)		
							//trade > proposed		
							responseMaker("pending");					
						}
						else if (tradeStatus.toLowerCase() == "proposed") {
							//allow non-proposed party to "accept" or "reject" 
							//trade > proposed		
							responseMaker("accept-reject");					
						}		
						else if (tradeStatus.toLowerCase() == "completed") {							
							// add no buttons?
							responseMaker("completed");
						}				
						else if (tradeStatus.toLowerCase() == "accepted") {							
							//TODO, respond to accepted...
							responseMaker("accepted");
						}
						else if (tradeStatus.toLowerCase() == "rejected") {							
							//TODO, how to respond to "rejection"
							responseMaker("rejected");
						}

						var leftSpace = document.querySelector("#left-book > #wrap-null");
						var rightSpace = document.querySelector("#right-book > #wrap-null");

						//render the "left" book in the formspace (requested book)
						if (leftSpace !== null) {
							renderSingle(foundTrade["pro_ownership"], "requested")
								.then(() => {
									if (rightSpace !== null) {
										renderSingle(foundTrade["rec_ownership"], "mine");
									}
								}).catch((e) => { console.log(e) });
						} else if (rightSpace !== null) {
							renderSingle(foundTrade["rec_ownership"], "mine")
								.catch((e) => { console.log(e) });
						}
						function renderSingle(ownId, tradeOrientation) {
							return new Promise((resolve, reject) => {
								let parentSpace;
								let classString;
								if (tradeOrientation == "requested") {
									parentSpace = "left-book";
									classString = " req-book-sup";
								} else if (tradeOrientation == "mine") {
									parentSpace = "right-book";
									classString = " my-book-sup";
								}
								//exclude the user in query parameters (don't want user to request their own book)
								let request = ('/club/?ownership=' + ownId);// + "&timeframe=" + timeFrame.toISOString());
								ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', request, 7000, function (err, data, status) {
									if (err) {
										console.log("request error" + err)
										reject(err);
									} else {
										// document.querySelector('#poll-view-request').innerHTML = "";
										var booksFound = JSON.parse(data);
										console.log(booksFound);
										//functionCB(booksFound, parentSpace, { classText: classString }, null); //resultCB);
										resolve(functionCB(booksFound, parentSpace, { classText: classString }, null));
									}
									/* 
										//barFormer callback
										functionCB(barsFound, 'poll-view', null, null);
										passedInFunction();
										//					formerCB();
									*/
								}));

							});
						}//renderSingle
					})
					.catch((e) => { console.log(e) });

				function queryServer(theTradeId) {
					return new Promise((resolve, reject) => {
						//query server with trade id
						ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', ('/my-trades?' + 'singleId=' + theTradeId), 8000, function (err, data, status) {
							if (err) {
								reject(err);
							}
							var tradeFound = JSON.parse(data);
							resolve(tradeFound[0]);
						}));//ajax call							
					});//prom
				}//queryServer
			}

		}//sufInit

	}; //return statement
}());