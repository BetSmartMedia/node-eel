# eel - EventEmitter Logging [![Build Status](https://secure.travis-ci.org/BetSmartMedia/node-eel.png?branch=master)](http://travis-ci.org/BetSmartMedia/node-eel)

eel is a logging "framework" that hopes to embody a few simple principles:

1. Logging should be easy.
2. Logs should record structured data.
3. Logging should be flexible.

It accomplishes these goals by decoupling the logging of events from the writing
of logs in the simplest way possible: using an
[EventEmitter][EventEmitter]


## Easy

The `eel` module exports a function that logs at the "info" level:

    log = require('eel')
    version = require('./package.json').version
    log("Started up", {version: version, port: port})

To log at another level, use the `log[level]` functions:

    process.on('uncaughtException', function (err) {
      log.error("uncaughtException", {err: err, stack: err.stack})
      process.exit(1)
    })

The default levels are debug, info, warning, error, and critical.


## Structured Data

Eel uses the [logstash JSON event format][ls_format] internally. Every logging
method takes a `@message` as the first parameter, and an object representing
the `@fields` part of a event as the second. Either parameter can be omitted,
and if you include any of the `@` prefixed "metadata" fields in the field data
object they will override the defaults.

Confused? Hopefully these examples will clarify:

    log('Something happened', {count: 10})
    /*
    { '@message': 'Something happened',
      '@tags': [],
      '@fields': { level: 'info', count: 10 },
      '@timestamp': '2012-12-16T05:44:48.125Z' }
    */

    log.warn('Something happened', {count: 10, '@tags': ['bad']})
    /*
    { '@message': 'Something happened',
      '@tags': ['bad'],
      '@fields': { level: 'warn', count: 10 },
      '@timestamp': '2012-12-16T05:44:48.125Z' }
    */

    log.error('Something happened', {'@message': 'Overridden!'})
    /*
    { '@message': 'Overridden!',
      '@tags': [],
      '@fields': { level: 'error' },
      '@timestamp': '2012-12-16T05:44:48.125Z' }
    */

Be careful, Eel doesn't go out of it's way to prevent you from generating
garbage log entries!

## Flexible

In addition to the various logging methods, the `eel` object also acts like an
[EventEmitter][EventEmitter]. In fact, none of the above examples produce any
output, because nothing is listening to the events being emitted. To rectify
this we can attach the simplest possible logging backend to the 'entry' event:

    log.on('info', console.log).on('error', console.error)

Now our prepared log entry objects will be printed to the console:

    log('Something happened', {relephant: 'data'})
    /* Actually prints this to the console:
    { '@message': 'Something happened',
      '@fields': { level: 'info', relephant: 'data' },
      '@timestamp': '2012-05-31T23:49:01.523Z' }
    */


## Logging Backends

Using `console.log` as a backend might suffice for development, but chances are
you will want to log to a file or centralized log aggregator (such as
[Logstash](logstash)) in production. Currently eel ships with 2
logging backends: files and TCP sockets.

### Configuring a backend

`require('eel').backends.configure('proto://...', ['warn', 'error', 'critical'])`

The first argument should be a string URI describing the logging destination.
The way the URI is interpreted depends on the protocol used (see below for
examples), while the `levels` parameter should be an array of log levels this
backend should handle.

When it comes time for your program to exit, you can tell a given logging
backend to close any resources it holds with `logging.backend.unload(uri)`.

### File Backend

`log.backends.configure('file:///var/log/my_program.log?rotateSize=10mb&maxFiles=10')`

The above will log to the file `/var/log/my_program.log` and rotate the log file
every time more than 10 megabytes has been written to it. At most 10 old log
files will be kept, named `my_program.log.[0-9]`.

#### File Backend Options

* rotateSize - Size at which log files will be rotated. Can be suffixed with
	kb/mb/gb/tb. 
* rotateSignal - A signal name that cause log files to be rotated.
* maxFiles - Number of old log files to keep. Beyond this number they will be
	destroyed. If a file backend is rotated via signal and no maxFiles parameter
	is given, it will re-open the same log file

### TCP backend

`log.backends.configure('tcp://localhost:1234', levels)`

This backend will write JSON events directly to a socket, separated by new
lines. It takes no additional options.

### Creating a custom backend

To create your own backend, you simply need to define a factory function that
will take a parsed URI and return a log event handler function. For example, a
simplified version of the TCP handler might look like this:

```javascript
var net = require('net')

module.exports = function (uri) {
	var socket = net.connect(uri.hostname, uri.port)
	return function (entry) { socket.write(JSON.stringify(entry) + '\n') }
}
```

_(The TCP handler that ships with eel also handles reconnecting on socket errors
and JSONifying circular structures)_

If your logging handler requires any cleanup for a program to cleanly exit, it's
good practice to attach an `end` method to the event handler:

```javascript
var net = require('net')

module.exports = function (uri) {
	var socket = net.connect(uri.host, uri.port)
	var handler = function (entry) { socket.write(JSON.stringify(entry) + '\n') }
	handler.end = socket.end.bind(socket)
	return handler
}
```

## TODO

Investigate using EventEmitter2 for namespacing and pattern matching log events.

[EventEmitter]: (http://nodejs.org/api/events.html#events_class_events_eventemitter)
[logstash]: (http://logstash.net)
[ls_format]: (https://github.com/logstash/logstash/wiki/logstash%27s-internal-message-format)
