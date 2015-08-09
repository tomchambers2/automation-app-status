var express = require('express')
var app = express()

app.use(express.static(__dirname + '/public'))

app.get('*', function(req, res) {
	res.sendFile(__dirname + '/public/index')
})

var server = app.listen(1234, function() {
	var host = server.address().address
	var port = server.address().port

	console.log('App listening at http://%s:%s', host, port)
})