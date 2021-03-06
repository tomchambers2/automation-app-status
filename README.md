# Adhesion - MQTT over WebSockets

**Notice:** Since version 1.4, Mosquitto supports native WebSockets. It may be a bright idea to check if the broker you use supports WebSockets before using a third-party library such as this.

Adhesion is a light-weight solution that allows you to directly use the familiar MQTT pub/sub commands in the browser. It saves you from having to write custom code, and you do not need to expose your MQTT broker to the world.

### More Information

* [Adhesion project site](http://adhesion.artofcoding.nl)

## Installing

```npm install adhesion```

## Using Adhesion

### Stand-alone

When using Adhesion as a stand-alone app, supply your MQTT and WebSocket settings in proxy_settings.json.

```json
{
    "mqtt_host": "localhost",
    "mqtt_port": 1883,
    "websocket_port": 8090
}
```

| Option                 | Type   | Default   | Description                                                     |
| -----------------------|--------|-----------| ----------------------------------------------------------------|
| mqtt_host              | String | localhost | MQTT broker host.                                               |
| mqtt_port              | Int    | 1883      | MQTT broker port.                                               |
| websocket_port         | Int    | 8090      | Port to open WebSocket on.                                      |
| topics_allow           | Array  | -         | Which topics the client is allowed to access (optional).        |
| topics_deny            | Array  | -         | Which topics the client is denied access (optional).            |
| deny_publish           | Bool   | false     | Deny client publish rights for all topics (optional).           |
| topics_allow_subscribe | Array  | -         | Which topics the client is allowed subscribe rights (optional). |
| topics_deny_subscribe  | Array  | -         | Which topics the client is denied subscribe rights (optional).  |
| topics_allow_publish   | Array  | -         | Which topics the client is allowed publish rights (optional).   |
| topics_deny_publish    | Array  | -         | Which topics the client is denied publish rights (optional).    |

You can start the proxy by issuing ```node proxy.js```. Of course you can use a system like Forever to keep it on line.

### In your own app

To use the Adhesion proxy in your own node.js application, you can use the methods exposed to you by Adhesion. A small example is as follows:

```js
var Adhesion = require('adhesion');

var server = new Adhesion.Server({
    'mqtt_host': 'localhost',       // defaults to localhost
    'mqtt_port': 1883,              // defaults to port 1883
    'websocket_port': 9234
});
server.on('connection', function(client) {
    console.log('Connection received...');
    client.on('error', function(err) {
        console.log('An error occured');
        console.log(err);
    });
    client.on('publish', function(topic, message, flags, allow) {
        console.log('Publish request on %s: %s', topic, message);
        return allow(true);  // Allow the request (true) or not (false)
    });
    client.on('subscribe', function(topic, allow) {
        console.log('Subscribe request on %s', topic);
        return allow(true);  // Allow the request (true) or not (false)
    });
});
server.on('error', function(err) {
    console.log('An error occured');
    console.log(err);
});
server.start(function() {
    console.log('Adhesion running');
});
```

### Client Example

Within the Adhesion package, you will find a file called client.js. This is the Adhesion client. The following code snippet shows how to connect to the proxy, subscribe to a topic and publish on a topic.

```js
var client = Adhesion.getClient('ws://localhost:8090');
client.on('error', function(error) {
    console.log('Got an error: %s!', error);
});
client.on('open', function() {
    console.log('Connection established!');
    client.subscribe('/var/www/#');
    client.publish('/var/www/ret', 'This works!', { retain: true }); // retain is optional
    client.on('message', function(topic, message) {
        console.log('%s %s', topic, message);
        client.close(); // close the WebSocket
    });
});
client.connect();
```

#### Reconnecting

Adhesion has support for auto-reconnect when the WebSocket is closed by an error. To enable reconnecting, give ```reconnect``` to the ```getClient``` function:

```js
// ...
var client = Adhesion.getClient('ws://localhost:8090', { 'reconnect': true, 'reconnect_tries': 3 });
```

```reconnect_tries``` is optional, and defaults to 3. If all three attempts fail, the client will emit the ```max_reconnected``` event.

```js
// ...
client.on('max_reconnected', function() {
	alert('Failed to reconnect to WebSocket!');
});
```

## Changelog

#### Version 0.2.2/0.2.3 - 27h July 2014

0.2.3
* Once again improvements to belowmentioned restriction vars
* Reconnection support

0.2.2
* Added 'not_allowed' and 'server_error' events to client
* Fixed 'topics_allow', 'topics_deny' and 'deny_publish' in proxy

#### Version 0.2.1 - 26h July 2014

* Improved 'topics_allow' and 'topics_deny' options in proxy
* Added 'deny_publish' option in proxy

#### Version 0.2.0 - 25th July 2014

* Rework of version 0.0.1, initial commit

## Planned

* Support for wildcards on proxy subscribe/publish allow/deny config
* Better error handling

## Licence

(The MIT License)

Copyright (C) 2014 Michiel van der Velde

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.