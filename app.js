function testConnection() {
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			alert(this.responseText);
		}
	}
	xmlhttp.open("GET", "http://localhost:9080/pws_timecards/includes/database.php", true);
	xmlhttp.send();
}

testConnection();