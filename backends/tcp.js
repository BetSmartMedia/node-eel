var net = require('net')
var streamHandler = require('./stream')

module.exports = function socketFactory (url) {
	var socket = net.connect(url.port, url.hostname);

	function socketError (err) {
		require('../').error("Socket emitted error " + err, {
			err: err,
			stack: err.stack,
			url: url
		})
	}

	socket.on('error', socketError)
	return streamHandler(socket)
}

module.exports.selfTest = function (t) {
	t.plan(12)
	var log = require('../')
		, expected = []
		, received
		;

	log.on('entry', expected.push.bind(expected))

	var server = net.createServer().on('connection', function (socket) {
		var offset = 0
		var buffer =  new Buffer(8912)
		socket.setEncoding('utf-8')
		socket.on('data', function (chunk) {
			offset += buffer.write(chunk, offset)
		}).on('end', function () {
			received = buffer.slice(0, offset - 1).toString().split('\n')
			server.close()
		})
	}).listen(1234, function () {
		log.backends.configure('tcp://localhost:1234', ['entry'])
		for (var i = 0; i < 10; i++) {
			log("Testing 1 2 3", {i: i})
		}
		log.backends.unload('tcp://localhost:1234')
	})

	server.on('close', function () {
		while (received.length && expected.length) {
			var line = received.shift()
			var entry = JSON.parse(line)
			t.deepEqual(expected.shift(), entry)
		}
		t.equal(0, expected.length, expected.length + " still expected")
		t.equal(0, received.length, received.length + " extra lines received")
	})
}

if (require.main === module) {
	require('tap').test('file backend', module.exports.selfTest)
}
