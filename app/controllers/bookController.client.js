'use strict';

var MYLIBRARY = MYLIBRARY || (function () {
	var _args = {}; // private
	var functionCB;
	var formerCB;
	var clearPins;
	return {
		init: function (Args) {
			_args = Args;
			// some other initialising
			functionCB = _args[0];
			formerCB = _args[1];
			//same function as resultsReset in authController.client.js
			clearPins = function (resultsTitle, resultsSelector){
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
		},
		//query to find club books
		bookFinder: function (passedInFunction) {		
			//listener for search bar
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

					// }//regtest
				}

				//executes on search
				function bookFind(searchValue) {
					var request = ('/our-pins?terms=' + searchValue);// + "&timeframe=" + timeFrame.toISOString());
					ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', request, 7000, function (err, data, status) {
						if (err) {
							console.log("request error")
						} else {
							//results header text							
							var pinResults = JSON.parse(data);							

							if(pinResults.pinsFound == "none"){
								console.log(pinResults);	
								clearPins("None found.");
							}else{
								clearPins("Pins Found: ").then(() => {
									console.log(pinResults);													
									functionCB(pinResults, 'poll-view', null, null);
								}).catch((e) => { console.log(e);});								
							}//else											
						}//else not error
					}));
				};

				//changes GUI 
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

			document.querySelector('input#gipSearch').addEventListener("keypress", function (e) {
				var key = e.which || e.keyCode;
				var i = document.querySelector('#gipSearch').value;
				if (key === 13) { // 13 is enter
					// code for enter
					console.log("fired input: " + i);
					let userInput = encodeURIComponent(i);
					let tagInput = document.querySelector('#gipTags').value.toUpperCase();
					//execute the GET
					pinAdd(userInput, tagInput);

					//handle GUI
					tabColourer("add-pin");
					// Dispatch "result space" event.
					document.querySelector('#gipSearch').value = "";
					document.querySelector('#gipTags').value = "";
				}
				var reg = new RegExp('^\S{0,50}$'); //search term less than 50				
				// if (reg.test(i)) {					
				// }
				function pinAdd(searchValue, tagsValues) {				
					var request = ('/my-pins/?link=' + searchValue + "&tags=" + tagsValues);// + "&timeframe=" + timeFrame.toISOString());
					ajaxFunctions.ready(ajaxFunctions.ajaxRequest('POST', request, 7000, function (err, data, status) {	
						if(err || status === 404){
							clearPins("Error adding pin...").then(
								window.location = "/?error-adding-pin"
							).catch((e) => { console.log(e);												});
						}else{
							var booksFound = JSON.parse(data);
							//results header text
							clearPins("Adding...").then(() => {
								console.log(booksFound);
								//execute my pins
								var pinsBtn = document.querySelector("#my-pins");
								if(pinsBtn !== null){
									let mouseVent = new MouseEvent("click")
									document.querySelector("#my-pins").dispatchEvent(mouseVent);	
								}
							}).catch((e) => {
								console.log(e);
							});												
						}//no err
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
		//pin HTML maker
		pinFormer: function (jsonData, parentIdString, optionsBF, cb) {			
			if (jsonData == null) { return; }
			var resultsView = document.getElementById(parentIdString) || document.getElementById('poll-view');  

			function clearExisting(){
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
			clearExisting().then(() => {
				//loop through json array, call HTML builder
				for (var i = 0; i < jsonData.length; i++) {
					//create a div for each pin
					var pId = ("pin-").concat(i);
					var jone = jsonData[i];
					//masonry	
					if (i == (jsonData.length - 1)) {
						// addElement(pId, resultsView, jone, optionsBF, formerCB);		
						addPinElement(pId, resultsView, jone, optionsBF, formerCB);
					} else {
						//execute the HTML builder code
						addPinElement(pId, resultsView, jone, optionsBF, null);
						// addElement(pId, resultsView, jone, optionsBF, null);		
					}
				}
			})
				.catch((e) => {
				console.log(e);
			});		

			function addPinElement(divName, parent, polljone, options, callb) {
				//parse a copy of the json data
				var pinCopy = JSON.parse(JSON.stringify(polljone));

				//div wrapper for entire object
				var newWrapSup = document.createElement("div");
				newWrapSup.className = "grid-item";
				newWrapSup.id = ("pin-wrap-sup-" + pinCopy["id"]);

				var likeLink = "/our-pins";

				//count div 
				var countDiv = document.createElement("div");
				countDiv.className = "pin-count";
				var countCount = document.createElement("div");
				countCount.innerHTML = "0";
				countCount.id = "pin-count-count";
				var countSym = document.createElement("span");
				countSym.innerHTML = " 🌟" ;
				countDiv.appendChild(countCount);
				countDiv.appendChild(countSym);

				//setup the "like button" based on server info
				if(polljone["self_likes"] == "1"){
					//already liked, prep to unlike
					countDiv.setAttribute("pole",false); 					
					countDiv.setAttribute("style", "background-color:green;");	
				}
				if (polljone["pinned_count"] >= 0) {
					countCount.innerHTML = polljone["pinned_count"] ;
					countDiv.addEventListener("click", likeAction.bind(countDiv), { once: false });
					function likeAction() {
						let bound = this;
						let pinStore = pinCopy["volume"];
						let pinPole = countDiv.getAttribute("pole") || true;
						bound.setAttribute("style", "background-color:grey;");
						ajaxFunctions.ready(ajaxFunctions.ajaxRequest('POST', (likeLink + "?pinid=" + pinStore + "&switch=" + pinPole), 8000, function (err, data, status) {
							if (err) { console.log(err); bound.innerHTML = "Error"; }
							else {
								//handle the server response
								let pinResp = JSON.parse(data);
								let arith = bound.querySelector("#pin-count-count");							
								if(pinResp.pinStatus == true){
									bound.setAttribute("pole",false);
									bound.setAttribute("style", "background-color:green;");										
									arith.innerHTML = ((parseInt(arith.innerHTML,10)) + 1);
								}else{
									bound.setAttribute("pole",true);
									bound.setAttribute("style", "");
									arith.innerHTML = ((parseInt(arith.innerHTML,10)) - 1);								
								}				
							}
						}));
					}//likeAction
					newWrapSup.appendChild(countDiv);

					//alternate method of liking/pinning
					// newWrapSup.addEventListener("click", likeAction.bind(countDiv), { once: false });
					// newWrapSup.addEventListener("click", springLike);
					function springLike(){						
						let mouseVent = new MouseEvent("click")
						countDiv.dispatchEvent(mouseVent);	
					}

				}//pinnedcount

				//setup delete button
				if (polljone["owned_pin"] !== "0") {
					let addButton = document.createElement("div");
					addButton.className = "btn";	

					addButton.innerHTML = "Delete?";
					addButton.addEventListener("click", delAction.bind(addButton), { once: true });
					var thisPin = polljone["volume"]
					function delAction() {
						if (window.confirm("This will delete pin. Confirm removal?")) {
							let bound = this;
							bound.innerHTML = "...";
							bound.setAttribute("style", "background-color:grey;");
							ajaxFunctions.ready(ajaxFunctions.ajaxRequest('DELETE', 'my-pins?pinid=' + thisPin, 8000, function (err, data, status) {
								let delResp = JSON.parse(data);
								if (err) { console.log(err); bound.innerHTML = "Error"; }
								else if(delResp["status"] == "Successful remove"){
									//handle the server response
									bound.setAttribute("style", "background-color: grey;");
									bound.innerHTML = "ok!";
									let parNode = bound.parentNode;
									let parParNode = parNode.parentNode;
									parParNode.removeChild(bound.parentNode);
								} else{									
								}
							}));
						}//alert box 
					}//delAction

					//append to DOM
					newWrapSup.appendChild(addButton);
				}//delete

				//user image
				if(polljone["userimg"] !== null && polljone["userimg"] !== undefined){
					let usrIconWrap = document.createElement("div");
					usrIconWrap.className = "user-icon";
						let usricon = document.createElement("img");
						usricon.src = polljone["userimg"];
						let userLink = document.createElement("a");
						userLink.setAttribute("href", ('/?user=' + polljone["userlink"]));				
					userLink.appendChild(usricon);
					usrIconWrap.appendChild(userLink);					
					newWrapSup.appendChild(usrIconWrap);
				}

				//"sup" wrap background image
				if (pinCopy["image_url"]) {
					var newWrapPic = document.createElement("img");
					newWrapPic.src = (pinCopy["url"]);
					newWrapSup.setAttribute("style",
					"background-image: url(" + pinCopy["image_url"] + ")");
					newWrapSup.appendChild(newWrapPic);
				}//if image_url						

				parent.appendChild(newWrapSup);

				//try the callback
				if (callb !== null) {
					try { 
						callb(); 
					} catch (TypeError) { console.log("no cb provided?"); }
				}
			} //addPinElement

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
				// newWrapSup.appendChild(newWrapInfo);

				//"sup" wrap background image
				if(pollCopy["image_url"]){
					var newWrapPic = document.createElement("img");
					newWrapPic.src = (pollCopy["url"]);
					// newWrapPic.className = "poll-wrap-pic";
					// newWrapPic.setAttribute("style",
						// "background-image: url(" + pollCopy["image_url"] + ")");
					// newWrapSup.setAttribute("style",
						// "background-image: url(" + pollCopy["image_url"] + ")");
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

						var likeLink = ('/pins?pinid=' + polljone.id);

						// console.log(addLink); // testing
						let addButton = document.createElement("div");
						addButton.className = "btn";
						//append to DOM
						newDiv.appendChild(addButton);
						if (controlType == "add") {
							addButton.innerHTML = "Add to Your Collection?";
							addButton.addEventListener("click", addAction.bind(addButton), { once: true });
						}
						else if (controlType == "delete") {							
							addButton.innerHTML = "Remove from your Collection?";
							addButton.addEventListener("click", delAction.bind(addButton), { once: true });
						} 
						else if (controlType == "like") {							
							addButton.innerHTML = "Like?";
							addButton.addEventListener("click", likeAction.bind(addButton), { once: true });				
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
						
						function likeAction() {
							let bound = this;
							bound.innerHTML = "Please Wait...";
							bound.setAttribute("style", "background-color:grey;");
							ajaxFunctions.ready(ajaxFunctions.ajaxRequest('POST', likeLink, 8000, function (err, data, status) {
								if (err) { console.log(err); bound.innerHTML = "Error"; }
								else {
									//handle the server response
									bound.setAttribute("style", "background-color:green;");
									bound.innerHTML = "Liked";
									// console.log(data);
								}
							}));
						}//likeAction	
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

