 var app = (function($) {
	 
	 var userName = 'jchai';
	 var locationTracker = [];
	 var userLocation;
	 var locationPrevailing;
	 var clockInButton = document.getElementById('clockin');
	 var clockInLabel = document.getElementById('clock-in-label-container');
	 var clockInLabelText = document.getElementById('clock-in-time-label');
	 var clockOutButton = document.getElementById('clockout');
	 var latePunchSubmit = document.getElementById('submit-late');
	 var p_id;
	 
	 return {
		 
		init: function() {
			clockInButton.disabled = true;
			clockOutButton.disabled = true;
			this.checkStatus().then(function (data) { 
				if (data) {
					p_id = data[0].p_id;
				}
				app.fillLocations().then(function () { 
					app.pageLoad(false);
				});
			});
			this.attachEventHandlers();
		},
		
		checkStatus: function() {
			return new Promise(function(resolve, reject) {
				var xhttp = new XMLHttpRequest();
				xhttp.onreadystatechange = function() {
					if (this.readyState == 4 && this.status == 200) {
						var response = this.responseText;
						if (response !== "false") {
							var responseJSON = JSON.parse(response);
							var date = responseJSON[0].punch_in.split(" ")[0].split("-");
							var time = responseJSON[0].punch_in.split(" ")[1].split(":");
							var userLocation = responseJSON[0].location_name;
							var dateString = date[1] + "/" + date[2] + "/" + date[0];
							var timeString;
							if (time[0] > 12) {
								timeString = time[0] - 12 + ":" + time[1] + " " + "PM";
							} else {
								timeString = time[0] + ":" + time[1] + " " + "AM";
							}
							clockInLabelText.innerHTML = "You clocked in at "
							+ timeString + " on " + dateString + " at " + userLocation;
							clockInLabel.className = '';
							clockInLabel.className = 'label-visible';
							clockOutButton.disabled = false;
						} else {
							clockInButton.disabled = false;
						}
						resolve(responseJSON);
					} else if (this.status == 404) {
						reject(xhttp.statusText);
					}
				};
				xhttp.open("POST", "http://localhost:9080/pws_timecards/includes/timeclock.php", true);
				xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
				xhttp.send("checkStatus=true&user=" + userName);
			});
		},
		
		clockIn: function() {
			clockInButton.disabled = true;
			userLocation = document.getElementById("location-list").value;
			app.findPrevailing(userLocation);
			return new Promise(function(resolve, reject) {
				var xhttp = new XMLHttpRequest();
				app.clockInProgress(true);
				xhttp.onreadystatechange = function() {
					if (this.readyState == 4 && this.status == 200) {
						var response = this.responseText;
						if (response === "true") {
							clockInLabel.className = "";
							clockInLabel.className = "label-visible";
							clockInLabelText.innerHTML = "You are now clocked in";
							clockOutButton.disabled = false;
							resolve(response);
						} else {
							clockInButton.disabled = false;
							reject(response);
						}
					} else if (this.status == 404) {
						reject(xhttp.statusText);
					}
				};
				xhttp.open("POST", "http://localhost:9080/pws_timecards/includes/timeclock.php", true);
				xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
				xhttp.send("timeIn=true&location=" + userLocation + "&prevailing=" + locationPrevailing + "&username=" + userName);
			});
		},
		
		clockOut: function() {
			if (p_id === undefined) {
				p_id = "undefined";
			}
			clockOutButton.disabled = true;
			app.clockInProgress(true);
			return new Promise(function(resolve, reject) {
				var xhttp = new XMLHttpRequest();
				app.clockInProgress(true);
				xhttp.onreadystatechange = function() {
					if (this.readyState == 4 && this.status == 200) {
						var response = this.responseText;
						if (response === "true") {
							clockInLabelText.innerHTML = "You are now clocked out";
							clockInButton.disabled = false;
							resolve(response);
						} else {
							clockOutButton.disabled = false;
							reject(response);
						}
					} else if (this.status == 404) {
						reject(xhttp.statusText);
					}
				};
				xhttp.open("POST", "http://localhost:9080/pws_timecards/includes/timeclock.php", true);
				xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
				xhttp.send("timeIn=false&p_id=" + p_id);
			});
		},
		
		latePunchIn: function() {
			latePunchSubmit.disabled = true;
			var locationEntry = document.getElementById('location-list-late').value;
			var startDate = document.getElementById("start-date");
			var endDate = document.getElementById("end-date");
			var startTimeDiv = document.getElementById("start-time-wrapper");
			var endTimeDiv = document.getElementById("end-time-wrapper");
			var startHour = document.getElementById("start-hour");
			var startMinute = document.getElementById("start-minute");
			var timeOfDayStart = document.getElementById("start-am-pm");
			var endHour = document.getElementById("end-hour");
			var endMinute = document.getElementById("end-minute");
			var timeOfDayEnd = document.getElementById("end-am-pm");
			var flipSwitch = document.getElementById("stay-in");
			var modifiedStartHour = 0; 
			var modifiedEndHour = 0;
			var stayIn = false;
			var elementArray = [startDate, endDate, startHour, startMinute,
								timeOfDayStart, endHour, endMinute, timeOfDayEnd, locationListLate];
								
			for (var item in elementArray) {
				if(elementArray[item].value.length === 0 || elementArray[item].value === "SELECT LOCATION") {
					return alert(elementArray[item]);
				}
			}
			
			app.findPrevailing(locationEntry);
			
			if (timeOfDayStart.value === "PM" && startHour.value !== 12) {
				modifiedStartHour = parseInt(startHour.value) + 12;
			}
			
			if (timeOfDayEnd.value === "PM" && endHour.value !== 12) {
				modifiedEndHour = parseInt(endHour.value) + 12;
			}
			
			if (flipSwitch.checked) {
				stayIn = true;
				clockInButton.disabled = true;
			}
			
			var sqlStartDate = app.convertDate(startDate);
			var sqlEndDate = app.convertDate(endDate);
			
			return new Promise(function(resolve, reject) {
				var xhttp = new XMLHttpRequest();
				xhttp.onreadystatechange = function () {
					if (this.readyState == 4 && this.status == 200) {
						var response = this.responseText;
						app.loadLatePunch(true);
						if (response === "sitrue" || response === "lptrue") {
							$("#latePunchError").popup("open");
							resolve(response);
						}
					} else {
						clockInButton.disabled = false;
						reject(this.statusText);
					}
				}
				xhttp.open("POST", "http://localhost:9080/pws_timecards/includes/timeclock.php", true);
				xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
				xhttp.send();
			});
			
		},
		
		
		fillLocations: function() {
			var locationListClockIn = document.getElementById("location-list");
			var locationListLate = document.getElementById("location-list-late");
			return new Promise(function(resolve, reject) {
				var xhttp = new XMLHttpRequest();
				xhttp.onreadystatechange = function() {
					if (this.readyState == 4 && this.status == 200) {
						var response = JSON.parse(this.responseText);
						for (var obj in response) {
							locationTracker.push({name: response[obj].name, prevailing: response[obj].prevailing});
							var optionClock = document.createElement("OPTION");
							var optionLate = document.createElement("OPTION");
							optionClock.text = response[obj].name;
							optionLate.text = response[obj].name;
							locationListClockIn.add(optionClock);
							locationListLate.add(optionLate);
							resolve(this.responseText);
						}
					} else if (this.status == 404) {
						reject(xhttp.statusText);
					}
				};
				xhttp.open("POST", "http://localhost:9080/pws_timecards/includes/timeclock.php", true);
				xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
				xhttp.send("getLocations=true");
			});
		},
		
		convertDate: function(str) {
			var orDate = '';
			var dateArray = [];
			for (var i = 0; i <= str.length; i++) {
				if (str[i] === "/" || i === str.length) {
					dateArray.push(orDate);
					orDate = '';
				} else {
					orDate += str[i];
				}
			}
			return dateArray;
		},
		
		clockInProgress: function(inProgress) {
			if (inProgress === true) {
				document.getElementById("clock-in-progress").className = "";
			} else {
				document.getElementById("clock-in-progress").className = "hidden";
			}
			
		},
		
		pageLoad: function(inProgress) {
			var modal = document.getElementById("modal-load");
			var loader = document.getElementById("boot-progress");
			if (inProgress !== true) {
				modal.className = "";
				modal.className = "modal-hidden";
				loader.className = "";
				loader.className = "modal-hidden";
			}
		},
		
		loadLatePunch: function(inProgress) {
			if (inProgress !== true) {
				console.log("Finished Loading");
			}
		},
		
		findPrevailing: function(userLocation) {
			for (var index in locationTracker) {
				if (locationTracker[index].name === userLocation) {
					locationPrevailing = locationTracker[index].prevailing;
				}
			}
		},
		
		attachEventHandlers: function() {
			clockInButton.addEventListener("click", function() {
				if (document.getElementById('location-list').value != "SELECT LOCATION") {
					app.clockIn().then(function() { 
						app.clockInProgress(false);
					});
				} else {
					$('#locationError').popup("open");
				}
			});
			clockOutButton.addEventListener("click", function() { app.clockOut().then(function() { app.clockInProgress(false);}); });
			document.getElementById("submit-late").addEventListener("click", app.latePunchIn);
		},
		
	 };
	 
 }(jQuery));
 
 app.init();
 
 