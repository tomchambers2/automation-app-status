
var events = require('events');
var util = require('util');

var WebSocketServer = require('ws').Server;
var mqtt = require('mqtt');

var Server = function(config) {
	events.EventEmitter.call(this);
	this.config = config;
	
	var self = this;
	this.start = function(cb) {
		wss = new WebSocketServer({port: self.config.websocket_port || 8090});
		wss.on('connection', function(ws) {
			self.emit('connection', new Client(ws, config));
		});
		if(cb) cb();
	};
};
util.inherits(Server, events.EventEmitter);

var Client = function(ws, config) {

	events.EventEmitter.call(this);
	this.config = config;
	this.ws = ws;
	var mqttClient = mqtt.createClient(this.config.mqtt_port || 1883, this.config.mqtt_host || 'localhost');
	
	var self = this;
	var subscribe = function(topic) {
		var allow = function(alloww) {
			if(alloww)
				mqttClient.subscribe(topic);
			else
				self.ws.send(JSON.stringify({ 'action': 'not_allowed', 'type': 'subscribe', 'topic': topic }));
		};
		self.emit('subscribe', topic, allow);
	};
	
	var publish = function(topic, message, flags) {
		var allow = function(alloww) {
			if(alloww)
				mqttClient.publish(topic, message, flags);
			else
				self.ws.send(JSON.stringify({ 'action': 'not_allowed', 'type': 'publish', 'topic': topic }));
		};
		self.emit('publish', topic, message, flags, allow);
	};
	
	self.ws.on('message', function(message) {
		try {
			message = JSON.parse(message);
			if(message.action == 'subscribe')
				subscribe(message.topic);
			else if(message.action == 'publish')
				publish(message.topic, message.message, message.flags || {});
		}
		catch(e) {
			self.ws.send(JSON.stringify({'action': 'error', 'type': 'parse', 'message': e.message}));
		}
	});
	
	mqttClient.on('message', function(topic, message) {
		var payload = { 'action': 'message', 'topic': topic, 'message': message };
		self.ws.send(JSON.stringify(payload), function(err) {
			if(err) self.emit('error', err);
		});
	});

};
util.inherits(Client, events.EventEmitter);

exports.Server = module.exports.Server = Server;