'use strict';

var MYLIBRARY = MYLIBRARY || (function () {
	var _args = {}; // private
	var functionCB;
	var formerCB;
	return {
		init: function (Args) {
			_args = Args;
			// some other initialising
			functionCB = _args[0];
			formerCB = _args[1];
		},
		//query to find club books
		bookFinder: function (passedInFunction) {
			var yelper = new Event('bookApi');
			// Listen for the event.
			var staticText = document.querySelector('#poll-view') || null;
			if (staticText !== null) {
				document.querySelector('#poll-view').addEventListener('bookApi', function (e) {
					this.innerHTML = "now finding, Please hold...";
				}, false);
			}
			document.querySelector('input#zipSearch').addEventListener("keypress", function (e) {
				var key = e.which || e.keyCode;
				var i = document.querySelector('#zipSearch').value;
				if (key === 13) { // 13 is enter					
					// code for enter
					console.log("fired input: " + i);
					let userInput = i.toUpperCase();
					var reg = new RegExp('^\S{0,50}$'); //search term less than 50				
					// if (reg.test(i)) {

					//execute the GET
					bookFind(userInput);

					//handle gui (tab)						
					tabColourer("search-club");
					document.querySelector('#zipSearch').value = "";
					// Dispatch "results" loading event
					document.querySelector('#poll-view').dispatchEvent(yelper);
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
					var request = ('/club/?terms=' + searchValue);// + "&timeframe=" + timeFrame.toISOString());
					ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', request, 7000, function (err, data, status) {
						if (err) {
							console.log("request error")
						} else {
							document.querySelector('#poll-view').innerHTML = "";
							//results header text
							let resultNote = document.querySelector("#results-text");
							resultNote.innerHTML = "Our Books Results: ";

							var booksFound = JSON.parse(data);							
							console.log(booksFound);													
							functionCB(booksFound, 'poll-view', null, null);
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
					if(fullOpacity !== null){
						fullOpacity.setAttribute("style", "");
					}					
				}
			});
		},
		//query to add a new book (google api pass through)
		bookAdder: function (passedInFunction) {
			var yelper = new Event('bookApi');
			// Listen for the event.
			var staticText = document.querySelector('#poll-view') || null;
			if (staticText !== null) {
				document.querySelector('#poll-view').addEventListener('bookApi', function (e) {
					this.innerHTML = "now finding, Please hold...";
				}, false);
			}
			document.querySelector('#gipSearch').setAttribute("style", "display: none");

			document.querySelector('input#gipSearch').addEventListener("keypress", function (e) {
				var key = e.which || e.keyCode;
				var i = document.querySelector('#gipSearch').value;
				if (key === 13) { // 13 is enter
					// code for enter
					console.log("fired input: " + i);
					let userInput = encodeURIComponent(i);
					let tagInput = document.querySelector('#gipTags').value.toUpperCase();
					//execute the GET
					bookFind(userInput, tagInput);

					//handle GUI
					tabColourer("add-pin");
					// Dispatch "result space" event.
					document.querySelector('#poll-view').dispatchEvent(yelper);
					document.querySelector('#gipSearch').value = "";
				}
				var reg = new RegExp('^\S{0,50}$'); //search term less than 50				
				// if (reg.test(i)) {					
				// }
				function bookFind(searchValue, tagsValues) {				
					var request = ('/my-pins/?link=' + searchValue + "&tags=" + tagsValues);// + "&timeframe=" + timeFrame.toISOString());
					ajaxFunctions.ready(ajaxFunctions.ajaxRequest('POST', request, 7000, function (err, data, status) {
						document.querySelector('#poll-view').innerHTML = "";
						//results header text
						let resultNote = document.querySelector("#results-text");
						resultNote.innerHTML = "Search Results: ";

						var booksFound = JSON.parse(data);
						console.log(booksFound);
						functionCB(booksFound, 'poll-view', { controls: "add" }, null);
					}));
				};
				//duplicate code
				function tabColourer(selectedTab) {
					let tabs = document.querySelectorAll(".navicon");
					tabs.forEach((thisTab) => {
						thisTab.setAttribute("style", "opacity: .7");
					});
					let fullOpacity = document.querySelector(("#") + selectedTab);
					fullOpacity.setAttribute("style", "");
				}
			});			
			document.querySelector('input#gipTags').addEventListener("keypress", function(e){
				var key = e.which || e.keyCode;
				var i = document.querySelector('#gipSearch').value;
				if (key === 13) { // 13 is enter
					// code for enter
					console.log("fired tags input: " + i);
					let userInput = i.toUpperCase();
					//fire off the gipSearch event			
					let keyVent = new KeyboardEvent("keypress",{keyCode: 13})
					document.querySelector("input#gipSearch").dispatchEvent(keyVent);	
				}
			});
			document.querySelector('#pin-adder').addEventListener("click", function(e){				
				var i = document.querySelector('#gipSearch').value;
				// if (key === 13) { // 13 is enter
					// code for enter
					console.log("fired adder btn: " + i);
					let userInput = i.toUpperCase();

					//fire off the gipSearch event			
					let keyVent = new KeyboardEvent("keypress",{keyCode: 13})
					document.querySelector("input#gipSearch").dispatchEvent(keyVent);	
				// }
			});		

		},

		//HTML DOM handler
		bookFormer: function (jsonData, parentIdString, optionsBF, cb) {
			/****** Reset Poll List*/
			// var yelper = new Event('bookApi');
			// Listen for the event.
			// document.querySelector('#poll-view').dispatchEvent(yelper);			
			/****** */
			var resultsView = document.getElementById(parentIdString);  //ul		
			if (resultsView.hasChildNodes()) {
				//clears the existing...
				while (resultsView.firstChild) {
					resultsView.removeChild(resultsView.firstChild);
				}
			}
			if (jsonData == null) { return; }
			//loop through json array, call HTML builder
			for (var i = 0; i < jsonData.length; i++) {
				//create a div for each poll
				var pId = ("book-").concat(i);
				var jone = jsonData[i];
				//execute the HTML builder code
				addElement(pId, resultsView, jone, optionsBF, null); //cb);
				//check node object for "count" flag
				/*TODO: swap "count" for "ownership flags"
				 if (jone.count > 0) {
					let cNodes = resultsView.childNodes;
					let lastChild = resultsView.childNodes[cNodes.length - 1];
					resultsView.removeChild(lastChild);
					resultsView.insertBefore(lastChild, resultsView.childNodes[0]);
				} */
			}
			if(typeof cb == "function"){
				cb();
				console.log("fired function");
			}			
			/**
			 * 
			 * @param {String} divName 
			 * @param {Element} parent 
			 * @param {JSON obj} polljone 
			 * @param {Object} options 
			 */
			function addElement(divName, parent, polljone, options, callb) {
				//parse a copy of the json data
				var pollCopy = JSON.parse(JSON.stringify(polljone));
				//var pollChoices = pollCopy.pollData;		

				//div wrapper for entire object
				var newWrapSup = document.createElement("div");
				newWrapSup.className = "poll-wrap-sup";
				newWrapSup.id = ("poll-wrap-sup-" + pollCopy["id"]);

				// wrapper for title, [optional count], and "poll-wrap"
				var newWrapInfo = document.createElement("div");
				newWrapInfo.className = "poll-wrap-info";
				
				//check if title exists JSON data
				if(polljone.title){
					//object-title div
					var titleDiv = document.createElement("div");
					titleDiv.className = "poll-title";
					var titleA = document.createElement("a");
					titleA.className = "poll-title";
					titleA.innerHTML = polljone.title;								
					titleDiv.appendChild(titleA);
					newWrapInfo.appendChild(titleDiv);
				}				
				/*	var addlink = '/my-books?isbn=' + polljone.isbn13;
					titleDiv.setAttribute("addlink",addlink);				
					titleDiv.addEventListener("click", addmine.bind(titleDiv), false);
					function addmine(){	
						let postlink = this.getAttribute("addlink");
						ajaxFunctions.ready(ajaxFunctions.ajaxRequest('POST', postlink, 8000, function (err, data, status) {
							if(err){console.log(err)}
							else{
								console.log(data);
							}
						}));					
				} */				

				//polljone.count div 
				var countDiv = document.createElement("div");
				countDiv.className = "appt-count";
				if (polljone.count >= 0) {
					countDiv.innerHTML = polljone.count + " GOING";
					newWrapInfo.appendChild(countDiv);
				}

				//poll-wrap
				var newWrap = document.createElement("div");
				newWrap.className = "poll-wrap";
				newWrapInfo.appendChild(newWrap);

				//append info to poll-wrap-sup
				newWrapSup.appendChild(newWrapInfo);

				//"sup" wrap background image
				if(pollCopy["image_url"]){
					var newWrapPic = document.createElement("a");
					newWrapPic.href = (pollCopy["url"]);
					newWrapPic.className = "poll-wrap-pic";
					newWrapPic.setAttribute("style",
						"background-image: url(" + pollCopy["image_url"] + ")");
					newWrapSup.appendChild(newWrapPic);
				}//if image_url			

				//divs: choice buttons
				var contDiv = document.createElement("div");
				contDiv.className = "container";
				contDiv.id = "vote-controls";

				//pre-"click" poll placeholder, contains object data
				var newDiv = document.createElement("div"); //change from ul
				newDiv.id = divName;
				newDiv.className = "poll-view-list-poll";
				//object data
				newDiv.setAttribute("poll-key", polljone.id);
				newDiv.setAttribute("poll-title", polljone.title);
				newDiv.setAttribute("book-data", polljone["json_string"]);

				// newDiv.innerHTML = JSON.stringify(polljone);
				detailer(newDiv, polljone);

				//pass in parent, adds details for each
				function detailer(parent, jsondata) {

					Object.keys(jsondata).map((val, ind, arr) => {
						if (jsondata[val] !== null && val !== "json_string" && val !== "language" && val !== "image_url" && val !== "url"){
							let detail = document.createElement("li");
							detail.id = (val + "-details");
							detail.innerHTML = (val.toUpperCase() + ": " + jsondata[val]);
							parent.appendChild(detail);
							return "";
						}						
					});
					function makeEle(){
					}
				}//detailer

				//if we're making an "Appointment" element, add the info
				if (polljone.appt) {
					newDiv.setAttribute("appt-key", polljone.appt["_id"]);
					newDiv.setAttribute("appt-time", polljone.appt["timestamp"]);
					let apptDate = new Date(Date.parse(polljone.appt["timestamp"]));
					let dayForm = "";
					switch (apptDate.getDay()) {
						case 0: dayForm = "Sunday"; break;
						case 1: dayForm = "Monday"; break;
						case 2: dayForm = "Tuesday"; break;
						case 3: dayForm = "Wednesday"; break;
						case 4: dayForm = "Thursday"; break;
						case 5: dayForm = "Friday"; break;
						case 6: dayForm = "Saturday"; break;
						default: dayForm = "";
					}

					var nowDate = new Date();
					//comparer date
					var seenDay = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate());

					//seen date is "today" 2am onward
					if (nowDate.getHours() >= 2) {
						// seenDay = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate());
					} else {
						//seen date is "yesterday" before 6am
						seenDay.setDate(seenDay.getDate() - 1);
					}
					//compare appt to framed "today"
					if (apptDate.getTime() < seenDay.getTime()) {
						showTextMaker("expired")
							.then(res => {
								res.className = "show-text expired-text";
								newWrap.appendChild(res);
								//set the main appt div to class 'expired'
								newWrapSup.className = newWrapSup.className + " expired";
							})
							.catch(e => console.log(e));
					} else {
						showTextMaker(dayForm)
							.then(res => {
								res.className = "show-text appt-text"
								newWrap.appendChild(res);
							})
							.catch(e => console.log(e));
					}
					console.log(dayForm);
					console.log(seenDay.toDateString());
				}

				newWrap.appendChild(newDiv);

				function showTextMaker(inner) {
					return new Promise((resolve, reject) => {
						var showText = document.createElement("span");
						showText.className = "show-text";
						showText.style = "color";
						if (inner) {
							showText.innerHTML = inner;
							resolve(showText);
						}
						else {
							showText.innerHTML = "click to book...";
							resolve(showText);
						}
						reject("error in showTextMaker");
					});
				}

				//optionally add the  "show-text" div		
				if (options !== null) {
					if (options.controls) {
						//pass in (option): which button type to append? add, delete, ...
						addControls(options.controls);
					}
					//add navigation buttons to book results
					function addControls(controlType) {
						let info = JSON.parse(polljone["json_string"]);
						let single = [];
						if (info.hasOwnProperty("id")) {
							single.push(info.id);
						}
						let addLink;
						
						if (single.length > 0) {
							addLink = ('/my-books?volume=' + single[0]);							
						}//identifier true	
						else {
							addLink = ('/my-books?volume=' + polljone.id);
						}
						// console.log(addLink); // testing
						let addButton = document.createElement("div");
						addButton.className = "btn";
						if (controlType == "add") {
							addButton.innerHTML = "Add to Your Collection?";
							addButton.addEventListener("click", addAction.bind(addButton), { once: true });
						}
						else if (controlType == "delete") {							
							addButton.innerHTML = "Remove from your Collection?";
							addButton.addEventListener("click", delAction.bind(addButton), { once: true });
						}
						//append to DOM
						newDiv.appendChild(addButton);
						//add function, query node
						function addAction() {
							// if (window.confirm("Add this book to your collection?")) {
								let bound = this;
								bound.innerHTML = "Please Wait...";
								bound.setAttribute("style", "background-color:grey;");
								ajaxFunctions.ready(ajaxFunctions.ajaxRequest('POST', addLink, 8000, function (err, data, status) {
									if (err) { console.log(err); bound.innerHTML = "Error"; }
									else {
										//handle the server response
										bound.setAttribute("style", "background-color:green;");
										bound.innerHTML = "Added";
										// console.log(data);
									}
								}));
							// }//alert box
						}//addAction	
						function delAction() {
							if (window.confirm("This will cancel any pending trades. Confirm book removal?")) {
								let bound = this;
								bound.innerHTML = "Please Wait...";
								bound.setAttribute("style", "background-color:grey;");
								ajaxFunctions.ready(ajaxFunctions.ajaxRequest('DELETE', addLink, 8000, function (err, data, status) {
									if (err) { console.log(err); bound.innerHTML = "Error"; }
									else {
										//handle the server response
										bound.setAttribute("style", "background-color: grey;");
										bound.innerHTML = "Removed";
										// console.log(data);
									}
								}));
							}//alert box 
						}//delAction
					}//addControls fn

					/** to add an event listener onclick for whole 'poll' element*/
					if(options.linker){
						addLinkFn(options.linker);
					}
					function addLinkFn(linkType){
						if(linkType == "trade"){
							newWrapSup.addEventListener("click", (thisWrap) => {
								window.location = ("/trade?tradeID=" + polljone.id );
							});
						}
					}
					newWrapSup.className = newWrapSup.className + " " + options.classText;
				}//options == not null

				//append sup to DOCUMENT					
				if (parent.hasChildNodes()) {
					let firstNode = parent.childNodes[0];
					parent.insertBefore(newWrapSup, firstNode);
				} else {
					parent.appendChild(newWrapSup);
				}
				// }
				//try the callback
				if (callb !== null) {
					try { callb(); } catch (TypeError) { console.log("no cb provided"); }
				}
			} //add element
		},//barFormer

		pinFormer: function (jsonData, parentIdString, optionsBF, cb) {
			var resultsView = document.getElementById(parentIdString);  //ul		
			if (resultsView.hasChildNodes()) {
				//clears the existing...
				while (resultsView.firstChild) {
					resultsView.removeChild(resultsView.firstChild);
				}
			}
			if (jsonData == null) { return; }

			//loop through json array, call HTML builder
			for (var i = 0; i < jsonData.length; i++) {
				//create a div for each pin
				var pId = ("pin-").concat(i);
				var jone = jsonData[i];
				//execute the HTML builder code
				addElement(pId, resultsView, jone, optionsBF, null);		
			}
	/**
			 * 
			 * @param {String} divName 
			 * @param {Element} parent 
			 * @param {JSON obj} polljone 
			 * @param {Object} options 
			 */
			function addElement(divName, parent, polljone, options, callb) {
				//parse a copy of the json data
				var pollCopy = JSON.parse(JSON.stringify(polljone));

				//div wrapper for entire object
				var newWrapSup = document.createElement("div");
				newWrapSup.className = "poll-wrap-sup";
				newWrapSup.id = ("poll-wrap-sup-" + pollCopy["id"]);

				// wrapper for title, [optional count], and "poll-wrap"
				var newWrapInfo = document.createElement("div");
				newWrapInfo.className = "poll-wrap-info";
				
				//check if title exists JSON data
				if(polljone.title){
					//object-title div
					var titleDiv = document.createElement("div");
					titleDiv.className = "poll-title";
					var titleA = document.createElement("a");
					titleA.className = "poll-title";
					titleA.innerHTML = polljone.title;								
					titleDiv.appendChild(titleA);
					newWrapInfo.appendChild(titleDiv);
				}					

				//polljone.count div 
				var countDiv = document.createElement("div");
				countDiv.className = "appt-count";
				if (polljone.count >= 0) {
					countDiv.innerHTML = polljone.count + " GOING";
					newWrapInfo.appendChild(countDiv);
				}

				//poll-wrap
				var newWrap = document.createElement("div");
				newWrap.className = "poll-wrap";
				newWrapInfo.appendChild(newWrap);

				//append info to poll-wrap-sup
				newWrapSup.appendChild(newWrapInfo);

				//"sup" wrap background image
				if(pollCopy["image_url"]){
					// var newWrapPic = document.createElement("a");
					// newWrapPic.href = (pollCopy["url"]);
					// newWrapPic.className = "poll-wrap-pic";
					// newWrapPic.setAttribute("style",
					// 	"background-image: url(" + pollCopy["image_url"] + ")");
					newWrapSup.setAttribute("style",
						"background-image: url(" + pollCopy["image_url"] + ")");
					// newWrapSup.appendChild(newWrapPic);
				}//if image_url			

				//divs: choice buttons
				var contDiv = document.createElement("div");
				contDiv.className = "container";
				contDiv.id = "vote-controls";

				//pre-"click" poll placeholder, contains object data
				var newDiv = document.createElement("div"); //change from ul
				newDiv.id = divName;
				newDiv.className = "poll-view-list-poll";
				//object data
				newDiv.setAttribute("poll-key", polljone.id);
				newDiv.setAttribute("poll-title", polljone.title);
				newDiv.setAttribute("book-data", polljone["json_string"]);

				// newDiv.innerHTML = JSON.stringify(polljone);
				detailer(newDiv, polljone);

				//pass in parent, adds details for each
				function detailer(parent, jsondata) {

					Object.keys(jsondata).map((val, ind, arr) => {
						if (jsondata[val] !== null && val !== "json_string" && val !== "language" && val !== "image_url" && val !== "url"){
							let detail = document.createElement("li");
							detail.id = (val + "-details");
							detail.innerHTML = (val.toUpperCase() + ": " + jsondata[val]);
							parent.appendChild(detail);
							return "";
						}						
					});
					function makeEle(){
					}
				}//detailer				

				newWrap.appendChild(newDiv);

				function showTextMaker(inner) {
					return new Promise((resolve, reject) => {
						var showText = document.createElement("span");
						showText.className = "show-text";
						showText.style = "color";
						if (inner) {
							showText.innerHTML = inner;
							resolve(showText);
						}
						else {
							showText.innerHTML = "click to book...";
							resolve(showText);
						}
						reject("error in showTextMaker");
					});
				}

				//optionally add the  "show-text" div		
				if (options !== null) {
					if (options.controls) {
						//pass in (option): which button type to append? add, delete, ...
						addControls(options.controls);
					}
					//add navigation buttons to book results
					function addControls(controlType) {
						let info = polljone;
						let single = [];
						if (info.hasOwnProperty("id")) {
							single.push(info.id);
						}
						let addLink;
						
						if (single.length > 0) {
							addLink = ('/my-books?volume=' + single[0]);							
						}//identifier true	
						else {
							addLink = ('/my-books?volume=' + polljone.id);
						}
						// console.log(addLink); // testing
						let addButton = document.createElement("div");
						addButton.className = "btn";
						if (controlType == "add") {
							addButton.innerHTML = "Add to Your Collection?";
							addButton.addEventListener("click", addAction.bind(addButton), { once: true });
						}
						else if (controlType == "delete") {							
							addButton.innerHTML = "Remove from your Collection?";
							addButton.addEventListener("click", delAction.bind(addButton), { once: true });
						}
						//append to DOM
						newDiv.appendChild(addButton);
						//add function, query node
						function addAction() {
							// if (window.confirm("Add this book to your collection?")) {
								let bound = this;
								bound.innerHTML = "Please Wait...";
								bound.setAttribute("style", "background-color:grey;");
								ajaxFunctions.ready(ajaxFunctions.ajaxRequest('POST', addLink, 8000, function (err, data, status) {
									if (err) { console.log(err); bound.innerHTML = "Error"; }
									else {
										//handle the server response
										bound.setAttribute("style", "background-color:green;");
										bound.innerHTML = "Added";
										// console.log(data);
									}
								}));
							// }//alert box
						}//addAction	
						function delAction() {
							if (window.confirm("This will cancel any pending trades. Confirm book removal?")) {
								let bound = this;
								bound.innerHTML = "Please Wait...";
								bound.setAttribute("style", "background-color:grey;");
								ajaxFunctions.ready(ajaxFunctions.ajaxRequest('DELETE', addLink, 8000, function (err, data, status) {
									if (err) { console.log(err); bound.innerHTML = "Error"; }
									else {
										//handle the server response
										bound.setAttribute("style", "background-color: grey;");
										bound.innerHTML = "Removed";
										// console.log(data);
									}
								}));
							}//alert box 
						}//delAction
					}//addControls fn

					/** to add an event listener onclick for whole 'poll' element*/
					if(options.linker){
						addLinkFn(options.linker);
					}
					function addLinkFn(linkType){
						if(linkType == "trade"){
							newWrapSup.addEventListener("click", (thisWrap) => {
								window.location = ("/trade?tradeID=" + polljone.id );
							});
						}
					}
					newWrapSup.className = newWrapSup.className + " " + options.classText;
				}//options == not null

				//append sup to DOCUMENT					
				if (parent.hasChildNodes()) {
					let firstNode = parent.childNodes[0];
					parent.insertBefore(newWrapSup, firstNode);
				} else {
					parent.appendChild(newWrapSup);
				}
				// }
				//try the callback
				if (callb !== null) {
					try { callb(); } catch (TypeError) { console.log("no cb provided"); }
				}
			} //add element


		}//pinFormer
	}; //return statement
}());

