
var adhesion = require('./index');
var proxy_config = require('./proxy_config');

var isIn = function(v1, v2) {
	for(var i in v1) {
		if(v1[i] == v2)
			return true;
	}
	return false;
};

var server = new adhesion.Server(proxy_config);
server.on('connection', function(client) {
	client.on('error', function(err) {
		console.log('Client error: %s', err);
	});
	client.on('subscribe', function(topic, allow) {
		if((!proxy_config.topics_allow || (proxy_config.topics_allow && isIn(proxy_config.topics_allow, topic))) ||
		(!proxy_config.topics_deny || (proxy_config.topics_deny && isIn(proxy_config.topics_deny, topic))))
			return allow(true);
		return allow(false);
	});
	client.on('publish', function(topic, message, flags, allow) {
		if((!proxy_config.topics_allow || (proxy_config.topics_allow && isIn(proxy_config.topics_allow, topic))) ||
		(!proxy_config.topics_deny || (proxy_config.topics_deny && isIn(proxy_config.topics_deny, topic))))
			return allow(true);
		return allow(false);
	});
});

server.on('error', function(err) {
	console.log('An error occured: %s', err.message);
	console.log(err.stack);
	process.exit(1);
});

server.start(function() {
	console.log('Adhesion Proxy running on port %s', proxy_config.websocket_port);
});