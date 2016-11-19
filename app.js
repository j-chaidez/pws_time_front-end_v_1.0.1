function testConnection() {
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var phpJSON = JSON.parse(this.responseText);
			for (var key in phpJSON) {
				alert(key + " : " + phpJSON[key]);
			}
		}
	}
	xmlhttp.open("GET", "http://localhost:9080/pws_timecards/includes/database.php", true);
	xmlhttp.send();
}

testConnection();