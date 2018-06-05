'use strict';

var AUTHLIB = AUTHLIB || (function () {
	var divCB;
	var extScript;
	var authScriptCB;
	var apiAuth = appUrl + '/auth/check';
	var defSearch = null;
	var loader;
	var clearPins; //clears pin results for multiple functions
	var _args = {}; // private
	//polyfill:
	if (window.NodeList && !NodeList.prototype.forEach) {
		NodeList.prototype.forEach = function (callback, thisArg) {
			thisArg = thisArg || window;
			for (var i = 0; i < this.length; i++) {
				callback.call(thisArg, this[i], i, this);
			}
		};
	}
	return {
		init: function (Args) {
			_args = Args;
			divCB = _args[0]; //MYLIBRARY.bookFormer
			extScript = _args[1] || null; //callback for external script
			authScriptCB = _args[2] || null;
			// some other initialising
			loader = this.loadLock;
			loader(false);

			clearPins = function (givenParent){
				var resultsView;
				if(givenParent){
					resultsView = document.getElementById(givenParent) || document.getElementById('poll-view');  
				}else{
					resultsView =document.getElementById('poll-view');
				} 
				return new Promise((resolve, reject) => {		
					if(resultsView.lastElementChild == null){
						resolve();
					}
					if(resultsView.lastElementChild.className !== "grid-sizer"){
						//clears the existing...										
						while (resultsView.firstChild && (resultsView.childElementCount > 1)) {
							console.log(resultsView.lastElementChild.className);
							resultsView.removeChild(resultsView.lastChild);
							if(resultsView.lastElementChild.className == "grid-sizer"){
								resolve();
							}
						}						
					}else if(resultsView.lastElementChild.className == "grid-sizer"){
						resolve();
					}else{
						reject();
					}
				});
			}
		},

		navi: function () {
			//navigation icon+header
			var homeIcon = document.getElementById('home-icon') || null;
			/**home-icon replacer */
			function makeNaviDiv() {
				var aIcon = document.createElement("a");
				aIcon.href = "/";
				var imgIcon = document.createElement("img");
				imgIcon.src = "/public/img/vota.png";
				imgIcon.style = "height: 80px; width: auto;";
				aIcon.appendChild(imgIcon);
				return aIcon;
			}
			if (homeIcon !== null) {
				//TODO choose to use home icon
				// homeIcon.replaceWith(makeNaviDiv());
			}
			var apiIcon = document.getElementById('api-icon') || null;
			/** api-icon replacer*/
			function makeAPIDiv() {
				var aIcon = document.createElement("a");
				aIcon.href = "https://www.yelp.com";
				var imgIcon = document.createElement("img");
				imgIcon.src = "/public/img/Yelp_trademark_RGB.png";
				imgIcon.id = "api-icon";
				aIcon.appendChild(imgIcon);
				return aIcon;
			}
			if (apiIcon !== null) {
				//TODO choose ot use api icon
				// apiIcon.replaceWith(makeAPIDiv());
			}
			/**set the search bar */
			let clubSearch = document.querySelector("#zipSearch");
			let bookSearch = document.querySelector("#gipSearch");
			// clubSearch.setAttribute("style", "display: none");

			/**listener for refresher */
			let refresher = document.querySelector('#fresh-appts');
			if (refresher !== null) {
				refresher.addEventListener('click', () => {
					//resets all visible appts
					refresher.className = refresher.className + " w3-spin"; //spin the image
					let resetApptsList = document.querySelector("#trades-view");
					if (resetApptsList.hasChildNodes()) {
						while (resetApptsList.firstChild) {
							resetApptsList.removeChild(resetApptsList.firstChild);
						}
						authScriptCB(false);
					} else {
						authScriptCB(false);
					}
				}, false);//event listener "click"
			}//refresher if

		}, //navi

		//executes after DOM loaded to contextually set up GUI, mimicking a user interaction
		finale: function () {
			//execute setup functions based on path
			let searchOursBtn = document.querySelector("#search-pins");			
			//search our books
			if (window.location.search == "?our-pins" && searchOursBtn !== null) {
				searchOursBtn.dispatchEvent(new MouseEvent("click"));
			}
		},//finale 

		authScript: function (zipIt) {
			return new Promise((resolve, reject) => {

				/**profile logout div "login-nav" */
				function makeDiv() {
					var newSpan2 = document.createElement("div");
					newSpan2.id = "login-nav";
					//container for login margins
					var newSpan3 = document.createElement("div"); 
					newSpan3.id = "login-nav-wrap";
					var aPro1 = document.createElement("a");
					aPro1.className = "menu";
					aPro1.href = "/profile";
					aPro1.innerHTML = "my Profile";
					var aLog1 = document.createElement("a");
					aLog1.className = "menu";
					aLog1.href = "/logout";
					aLog1.innerHTML = "Logout";
					var pBar = document.createElement("p");
					pBar.innerHTML = "|";
					newSpan3.appendChild(aPro1);
					newSpan3.appendChild(pBar);
					newSpan3.appendChild(aLog1);
					newSpan2.appendChild(newSpan3);

					return newSpan2;
				}
				/**login sign-in div  "login-nav"*/
				function makeDefaultDiv() {
					var newSpan = document.createElement("div");
					newSpan.id = "login-nav";
					var aPro = document.createElement("a");
					var aLog = document.createElement("div");
					aLog.className = "btn";
					aLog.id = "login-btn";
					var iBar = document.createElement("img");
					iBar.width = "158";
					iBar.height = "28";
					// iBar.src = "https://static.xx.fbcdn.net/rsrc.php/v3/yC/r/aMltqKRlCHD.png";
					iBar.src = "/public/img/sign-in-with-twitter-gray.png";
					iBar.alt = "app-twitter";
					// var pText = document.createElement("p");
					// pText.innerHTML = "Sign in with Twitter";
					newSpan.appendChild(aPro);
					aPro.appendChild(aLog);
					aLog.appendChild(iBar);
					// aLog.appendChild(pText);
					return newSpan;

				}
				//resets navigator placeholder when a new auth call is made
				function resetNavi() {
					var resetSpan = document.createElement("span");
					resetSpan.id = "auth-container";
					return resetSpan;
				}
				/**ask node.js if user is authenticated */
				ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', apiAuth, 8000, function (err, data, status) {
					//reset navi for new auth call
					let resetAttempt = document.querySelector("#login-nav");
					if (resetAttempt !== null) {
						resetAttempt.replaceWith(resetNavi());
					}
					//server response to authentication check		
					var authObj = JSON.parse(data);
					if (authObj == null) { console.log("auth check null "); return; }

					var authNode = document.getElementById('auth-container');
					/* default search bar function, used in nightlife app
						var reg = new RegExp('^(\\d\\d\\d\\d\\d)$');
						if (reg.test(authObj.zipStore) && zipIt) {
						//zipIt prevents search when authScript called elsewhere
							var keyup = new Event('keyup');
							document.querySelector('#zipSearch').value = authObj.zipStore;
							document.querySelector('input#zipSearch').dispatchEvent(keyup);				
						}
					*/
					let navi = document.querySelector("#navi");
					//if user is authenticated:
					if (authObj.authStatus == 1) {
						//"login-nav" div (profile | sign out)
						authNode.replaceWith(makeDiv());
						let dName = document.querySelector("#display-name");
						if (dName !== null) {
							dName.innerHTML = (", <br>" + authObj.displayName);
						}
						descriptUser(authObj);
					
						//add "My Books" div
						navi.appendChild(makeMyBooks());
						//add listener
						var booksBtn = document.querySelector("#my-pins");
						booksBtn.addEventListener("click", myBooksFn, false);

						//search book club
						navi.appendChild(makeSearchClub());
						var clubBtn = document.querySelector("#search-pins");
						clubBtn.addEventListener("click", searchClub, false);
						
						//add pins
						navi.appendChild(makeAddPin());
						var addsBtn = document.querySelector("#add-pin");
						addsBtn.addEventListener("click", addPin, false);
					}
					//if user is not authenticated
					else {
						//remove appts div "profile-container" because "not authed"
						// document.querySelector('#trades-container').remove();
						if (authNode !== null) {
							//add the facebook "sign in" button
							authNode.replaceWith(makeDefaultDiv());
							document.querySelector('#login-btn').addEventListener('click', function () {
								location.replace('/auth/twitter');
							});
						}
						//remove lockpic
						loader(false);
					}//authObj.authStatus else
				}));

				//fills in the profile data
				function descriptUser(userData) {
					let profId = document.querySelector("#profile-id");
					let profUser = document.querySelector("#profile-username");
					let profCity = document.querySelector("#profile-city");
					let profState = document.querySelector("#profile-state");
					if (profId !== null) {
						profId.innerHTML = (userData.userId);
					}
					if (profUser !== null) {
						profUser.innerHTML = (userData.displayName);
					}
					if (profCity !== null) {
						profCity.innerHTML = (userData.city);
					}
					if (profState !== null) {
						profState.innerHTML = (userData.state);
					}
				}

				function tabColourer(selectedTab) {
					let tabs = document.querySelectorAll(".navicon");
					tabs.forEach((thisTab) => {
						thisTab.setAttribute("style", "opacity: .7");
					});
					let fullOpacity = document.querySelector(("#") + selectedTab);
					fullOpacity.setAttribute("style", "");
				}

				function makeMyBooks() {
					//<div id="api-icon" class="navicon">API ICON</div>
					let newDiv = document.createElement("div");
					newDiv.id = "my-pins";
					newDiv.className = "navicon";
					let aPro1 = document.createElement("a");
					aPro1.className = "tab";
					//href not used, event listener instead
					// aPro1.href = "/my-books";
					aPro1.innerHTML = "My Pins";
					newDiv.appendChild(aPro1);
					return newDiv;
				}//makeMyBooks			

				//execute on btn click
				function myBooksFn() {
					tabColourer("my-pins");			
					//GUI : hide trades					
					/* if(window.location.pathname == '/profile'){
						console.log(window.location);
						let tradesShown = document.querySelector("#trades-view");
						if(tradesShown !== null){
							// tradesShown.setAttribute("style","display: none");
							document.querySelector("#trades-navi").dispatchEvent(new MouseEvent("click"));
						}
						}//pathname == trades		
					*/	
					//clear the results...
					resultsReset("My Pins:");				
					//2. query node for user books
					ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', '/my-pins', 8000, function (err, data, status) {
						var pinsFound = JSON.parse(data);
						if (err) { console.log(err) }
						else if (pinsFound["pinsFound"] == "none" ) {
							resultsReset("No pins found.");
						}
						else {
							resultsReset("My Pins: ").then(() => {
								console.log(pinsFound);
								divCB(pinsFound, 'poll-view', { classText: "owned-pin grid-item", controls: "delete" }, null);
							}).catch((e) => {
								console.log(e);
							});						
						}//else						
					}));//ajax call				
				}
				//to-remove mytrades
				function myTradesFn() {
					//redirect to profile if not there...
					if (window.location.pathname !== '/profile' && window.location.pathname !== '/profile?trades') {
						window.location = "/profile?trades";
					} else {
						// console.log(window.location); //testing
						//GUI notification
						tabColourer("my-trades");						
						//TODO: add a "show button?" or show my clicking "my profile"?
						//hide the profile div
						// document.querySelector("#profile-container").setAttribute("style", "display: none");
						//Inform User, app is "loading..."
						var tempText = document.querySelector("#trades-text");
						//show the trades list...
						if (document.querySelector("#trades-view").getAttribute("show-status") == "false") {
							document.querySelector("#trades-navi").dispatchEvent(new MouseEvent("click"));
						}
						var proCon = document.querySelector("#trades-container") || null;
						if (tempText !== null) {
							tempText.innerHTML = "Loading...";
							// loader(true); //toggle lock pic
						}
						//query server
						ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', '/my-trades', 8000, function (err, data, status) {
							if (tempText !== null) { tempText.innerHTML = "My Trades:"; }
							// console.log(data);
							var tradesFound = JSON.parse(data);
							renderTrades(tradesFound);
						}));//ajax call	

						function renderTrades(tradeData) {
							//no "new" bars compared to pre-delete					 
							if (tradeData.tradesFound == "none") {
								proCon.setAttribute("style", "display: unset");
								// proCon.appendChild(makeAppts("none found"));						
								// loader(false);		//lockpic off			
							}//Found some appointments
							else {
								proCon.setAttribute("style", "display: unset");
								//third arg is div class //divCB is called within barFormer.addElement
								tradeData.sort(function (a, b) {
									let aTime = new Date(a["date_proposed"]);
									let bTime = new Date(b["date_proposed"]);
									return aTime.getTime() - bTime.getTime();
								});
								divCB(tradeData, "trades-view", { "classText": " trade", linker : "trade" }, null);
								// addDeleteDiv();						
								// loader(false); //toggle lock pic
							}
							//unspin the icon
							// let refreshIcon = document.querySelector('#fresh-appts')
							// refreshIcon.className = refreshIcon.className.substring(0, (refreshIcon.className.length - 9));
							/****** */
							/* let profSpace = document.querySelector("#trades-container");
								profSpace.setAttribute("style", "display: unset");
								// let tradesList = document.querySelector("#trades-view");
								// let holder = document.createElement("div");
								// holder.innerHTML = tradeData;
								// tradesList.appendChild(holder);
								let tO = [{ title: tradeData}];
								// let tempJson = JSON.parse(tO.toString());
								divCB(tO, 'trades-view', {classText: "trade", controls: null}, null);	
							*/
						}//renderTrades
					}
				}//myTradesFn

				function makeAddPin() {
					let newDiv = document.createElement("div");
					newDiv.id = "add-pin";
					newDiv.className = "navicon";
					let aPro1 = document.createElement("a");
					aPro1.className = "tab";
					//href not used, event listener instead
					// aPro1.href = "/my-trades";
					aPro1.innerHTML = "Add Your <br> Pin";
					newDiv.appendChild(aPro1);
					return newDiv;
				}//makeAddPins

				function addPin() {
					tabColourer("add-pin");					
					//show our bar:
					document.querySelector("#gipSearch").setAttribute("style", "display: unset"); 
					document.querySelector("#gipTags").setAttribute("style", "display: unset"); 			
					document.querySelector("#pin-adder").setAttribute("style", "display: unset"); 	
				}
				function resultsReset(resultsTitle, resultsSelector){
					var resultsView;
					let resultNote = document.querySelector("#results-text");
					if(resultNote !== null){
						resultNote.innerHTML = resultsTitle;
					}		
					return new Promise((resolve, reject) => {
						if (resultsSelector) {
							resultsView = document.getElementById(resultsSelector) || document.getElementById('poll-view');
							if (resultsView.lastElementChild == null) { resolve(); }
						} else {
							resultsView = document.getElementById('poll-view');
							if (resultsView.lastElementChild == null) { resolve(); }
						}
						if (resultsView.lastElementChild.className !== "grid-sizer") {
							//clears the existing...										
							while (resultsView.firstChild && (resultsView.childElementCount > 1)) {
								console.log(resultsView.lastElementChild.className);
								resultsView.removeChild(resultsView.lastChild);
								if (resultsView.lastElementChild.className == "grid-sizer") {
									resolve();
								}
							}
						} else if (resultsView.lastElementChild.className == "grid-sizer") {
							resolve();
						} else {
							reject();
						}
					});										
				}//resultsReset
				function makeSearchClub() {
					let newDiv = document.createElement("div");
					newDiv.id = "search-pins";
					newDiv.className = "navicon";
					let aPro1 = document.createElement("a");
					aPro1.className = "tab";
					//href not used, event listener instead				
					aPro1.innerHTML = "Search our <br> Pins";
					newDiv.appendChild(aPro1);
					return newDiv;
				}//makeSearchClub

				function searchClub() {
					// console.log(window.location); //testing
					if(window.location.pathname !== "/" && window.location.search !== "?our-pins"){
						//redirect to home page
						// console.log(window.location.pathname); //testing
						window.location = "/?our-pins";
					} else {
						tabColourer("search-pins");
						//hide all unused bars:
						let allBars = document.querySelectorAll(".sbar");
						allBars.forEach((searchBar) => {
							searchBar.setAttribute("style", "display: none");
							document.querySelector("#pin-adder").setAttribute("style", "display: none");							
						});
						
						//show our bar:
						document.querySelector("#zipSearch").setAttribute("style", "display: unset");
						//reset Results Area:
						resultsReset("Our Pins: ").then(() => {
							//default search
							let keyVent = new KeyboardEvent("keypress", { keyCode: 13 })
							document.querySelector('input#zipSearch').dispatchEvent(keyVent);
						}).catch((e) => {
							console.log(e);
						});
					}					
				}//searchClub
			});
		},

		fbControl: function (cb) {
			window.fbAsyncInit = function () { };
			// Load the SDK asynchronously
			(function (d, s, id) {
				var js, fjs = d.getElementsByTagName(s)[0];
				if (d.getElementById(id)) return;
				js = d.createElement(s); js.id = id;
				js.src = "https://connect.facebook.net/en_US/sdk.js";
				fjs.parentNode.insertBefore(js, fjs);
			}(document, 'script', 'facebook-jssdk'));

		},

		chooser: function (passedInFn) {
			var cButtons = document.querySelectorAll(".poll-wrap-sup") || null;
			for (var cButton of cButtons) {
				if (cButton.className !== "poll-wrap-sup appt-wrap-sup") {
					//add a new choice to an existing poll					
					cButton.addEventListener('click', clickHandle.bind(cButton), false);//click listener					
				}//classname check
			}//loop

			/*			Search Result bar clicks (add and remove)			*/
			function clickHandle() {
				//lockpic on
				loader(true);
				var tDay = new Date();
				// tDay.setHours(21); //for testing
				var toDate = new Date(tDay.getFullYear(), tDay.getMonth(), tDay.getDate())
				if (tDay.getHours() >= 20) {
					toDate.setDate(toDate.getDate() + 1);
					// toDate.setDate(toDate.getDate() - 1); //for testing
					// console.log('if passed');
				}
				var keyName = this.querySelector('.poll-view-list-poll');
				let that = this;
				that.querySelector(".show-text").innerHTML = "please hold...";
				//if "app key" check
				if (!that.hasAttribute("appt-key")) {
					//post server for 'this' bar and 'today'					
					ajaxFunctions.ajaxRequestLim('POST', '/bars/db?date=' + toDate.toISOString() + "&" + "bid=" + keyName.getAttribute("poll-key"), 10000,
						function (err, response, status) {
							let respJSON = JSON.parse(response);
							if (status == 403) {
								//lockpic off
								loader(false);
								that.querySelector(".show-text").innerHTML = "Sign in to book...";
								alert("please sign in ...");
								that.removeEventListener('click', clickHandle);
								return;
							}
							else if (respJSON == null) {
								//lockpic off
								loader(false);
								that.querySelector(".show-text").innerHTML = "click to book...";
								alert("please wait...");
								that.removeEventListener('click', clickHandle);
								return;
							}
							else {
								that.setAttribute("style", "border-color: #ebc074; background-color: #f5deb7");
								that.querySelector(".show-text").innerHTML = "booked!";
								that.querySelector(".show-text").setAttribute("style", "color: #f15c00");
								//if keys match
								if (keyName.getAttribute("poll-key") == respJSON["appt"]["yelpid"]) {
									//append the new "appt-key" to this bar div
									that.setAttribute("appt-key", respJSON["appt"]["_id"]);
								}
							}
							//lockpic on
							loader(true);
							//execute AUTHLIB.authScript(false) as a cb
							authScriptCB(false);
						});//ajax
				} else {
					//click action to "unbook" this bar
					//lockpic off
					loader(false);
					deleteCB(that);
				}//else

				function deleteCB(arg) {
					var keyS = arg.getAttribute("appt-key");
					var titleS = arg.title;
					arg.setAttribute("style", "border-color: unset; background-color: unset");
					let zat = arg;
					ajaxFunctions.ajaxRequest('DELETE', '/bars/db?appt=' + keyS, false, function (response2) {

						let pareOut = document.querySelector("#trades-view");
						pareOut.removeChild(pareOut.querySelector('[appt-key=\"' + keyS + '\"').parentNode.parentNode.parentNode);

						zat.querySelector(".show-text").innerHTML = "click to book...";
						zat.querySelector(".show-text").setAttribute("style", "");
						zat.removeAttribute("appt-key");
						//execute AUTHLIB.authScript(false) as a cb
						authScriptCB(false);
					});
					//					 }
				}//deleteCB function			
			}// clickHandle function
		},//chooser

		loadExtScript: function () {
			return new Promise(function (resolve, reject) {
				var s;
				s = document.createElement('script');
				s.src = extScript;
				s.onload = resolve;
				s.onerror = reject;
				document.head.appendChild(s);
			});
		},

		loadLock: function loadLock(boo) {
			let lockPic = document.querySelector('#loading');
			if (boo === true) {
				lockPic.style = "";
				lockPic.setAttribute('lock', "on");
			}
			else if (boo === false) {
				lockPic.style = "display: none";
				lockPic.setAttribute('lock', "off");
			}
			else {
				if (lockPic.getAttribute('lock') == 'on') {
					lockPic.style = "display: none";
					lockPic.setAttribute('lock', "off");
				} else {
					lockPic.style = "";
					lockPic.setAttribute('lock', "on");
				}
			}
		}
	};
})();
