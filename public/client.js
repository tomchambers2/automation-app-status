var Adhesion = {
	isSupported: function() {
		return typeof(WebSocket) == "function";
	},
	getClient: function(host, opt) {
		var Client = function(host) {
			this.host = host;
			this.event_handlers = {};
			this.websocket = null;
			this.websocket_open = false;
			this.options = opt || {};
			this.ws_error = false;
			this.connect_tries = 0;
			
			var self = this;
			this.on = function(event, handler) {
				self.event_handlers[event] = handler;
			};
			this.connect = function() {
				self.connect_tries++;
				self.websocket = new WebSocket(self.host);
				self.websocket.onopen = function() {
					self.websocket_open = true;
					self.ws_error = false;
					self.connect_tries = 0;
					if(self.event_handlers['open']) self.event_handlers['open']();
				};
				self.websocket.onerror = function(error) {
					if(self.event_handlers['error'])
						self.event_handlers['error'](error);
					else
						console.log(error); // fallback if error event is not registered
					self.websocket_open = false;
					self.ws_error = true;
				}
				self.websocket.onclose = function() {
					self.websocket_open = false;
					if(self.event_handlers['close']) self.event_handlers['close']();
					if(self.ws_error && self.options.reconnect && self.connect_tries < (self.options.reconnect_tries || 3)) {
						self.connect();
					}
					else if(self.options.reconnect_tries >= (self.options.reconnect_tries || 3)) {
						if(self.event_handlers['max_reconnected'])
							self.event_handlers['max_reconnected']();
					}
				};
				self.websocket.onmessage = function(event) {
					var message = JSON.parse(event.data);
					//console.log(message.action);
					if(message.action == 'message') {
						if(self.event_handlers['message'])
							self.event_handlers['message'](message.topic, message.message);
					}
					else if(message.action == 'not_allowed') {
						if(self.event_handlers['not_allowed'])
							self.event_handlers['not_allowed'](message.type, message.topic);
					}
					else if(message.action == 'error') {
						if(self.event_handlers['server_error'])
							self.event_handlers['server_error'](message.type, message.error);
					}
				};
			};
			this.close = function() {
				this.websocket.close();
			};
			this.publish = function(topic, message) {
				if(!self.websocket_open) return self.event_handlers['error'](new Error('WebSocket not opened'));
				var payload = JSON.stringify({ 'action': 'publish', 'topic': topic, 'message': message });
				this.websocket.send(payload);
			};
			this.subscribe = function(topic) {
				if(!self.websocket_open) return self.event_handlers['error'](new Error('WebSocket not opened'));
				var payload = JSON.stringify({ 'action': 'subscribe', 'topic': topic });
				this.websocket.send(payload);
			};
		};
		return new Client(host);
	}
};