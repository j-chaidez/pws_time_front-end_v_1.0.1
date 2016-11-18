<?php
	header("Access-Control-Allow-Origin: *");
	class Database {
		
		public $dbserver;
		public $username;
		public $password;
		public $con;
	
		public function __construct(){
			
			$this->dbserver = "localhost";
			$this->username = "jonathan";
			$this->password = "holdon12";
			$this->con = new mysqli($this->dbserver, $this->username, $this->password);
			if ($this->con->connect_error) {
				die("Connection failed: " . $this->con->connect_error);
				echo "Connection failed: " . $this->con->connect_error;
			} else {
				echo "Connected successfully";
			}
			
		}
	}
	echo "HELLO";
	$database = new Database();
	