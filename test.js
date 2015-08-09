var mqtt = require('mqtt')

	var mqttClient = mqtt.connect('mqtt://test.mosquitto.org');
	mqttClient.publish('whatever','hello!')

	mqttClient.on('connect', function() {
		console.log("CONNECTED!!!")
	})

	mqttClient.on('close', function() {
		console.log("fail!!! close")
	})		

	mqttClient.on('offline', function() {
		console.log("fail!!! offline")
	})		

	mqttClient.on('error', function() {
		console.log("fail!!!")
	})	