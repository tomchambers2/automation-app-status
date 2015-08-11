var client = Adhesion.getClient('ws://192.168.1.74:8090')

var data = {
	messages: [],
	devices: {}
}

function updateMessages() {
	$('.message-log').text('')
	data.messages.forEach(function(message) {
		$('.message-log').append('<tr><td>'+moment(message.timestamp).fromNow()+'</td><td>'+message.topic+'</td><td>'+message.message+'</td></tr>')
	})
	$('.message-count').text(data.messages.length)

	setTimeout(updateMessages, 16)
}

function updateDevices() {
	$('.device-status').text('')
	for (key in data.devices) {
		var device = data.devices[key]
		var stateClass = device.state > 0 ? "on" : "off"
		$('.device-status').append('<tr><td>'+device.name+'</td><td>'+device.type+'</td><td>'+device.subType+'</td><td class="state ' + stateClass + ' "></td><td>'+moment(device.lastUpdate).fromNow()+'</td></tr>')
	}

	setTimeout(updateDevices, 16)	
}

client.on('error', function(error) {
	console.log('Got error %s',error)
})

client.on('open', function() {
	console.log('Connection established')
	client.subscribe('#')

	client.publish('test','message')

	client.publish('devices/discover','#')

	client.on('message', function(topic, message) {
		data.messages.unshift({ topic: topic, message: message, timestamp: new Date() })
	
		console.log(topic=='devices/new')

		if (topic=='devices/new') {
			var device = JSON.parse(message)
			console.log(device)
			data.devices[device.name] = device
			data.devices[device.name].lastUpdate = new Date()
		}

		if (topic=='devices/update') {
			console.log('Device updated')
			var device = JSON.parse(message)
			data.devices[device.name] = device
			data.devices[device.name].lastUpdate = new Date()
		}

		updateMessages()
		updateDevices()
	})

	console.log('have set callback')
})

client.connect()