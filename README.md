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
    log("startup", {version: version})

To log at another level, use the `log[level]` functions:

    process.on('uncaughtException', function (err) {
      log.error("uncaughtException", {err: err})
      process.exit(1)
    })

The default levels are debug, info, warning, error, and critical.

## Structured Data

The first argument to any logging function is the event type. While this
can be any type of object, it's convention to use dot-separated names. The
second (optional) argument is an object. This object will have the log level,
the event type, and a timestamp assigned to it before it is *emitted*. Which
brings us to principle number 3...

## Flexible

In addition to the various logging methods, the `eel` object also acts like an
[EventEmitter][EventEmitter] methods to an internal EventEmitter. In
fact, none of the above examples produce any output, because nothing is
listening to the events being emitted. To rectify this we can attach the
simplest possible logging backend to the 'entry' event:

    log.on('entry', console.log)

Now our prepared log entry objects will be printed to the console:

    log('blah', {relephant: 'data'})
    /* prints
    { type: 'blah',
      level: 'info',
      relephant: 'data',
      timestamp: '2012-05-31T23:49:01.523Z' }

## Logging backends

For more fancy logging setups the following logging backends are available. If you
write your own let me know or send me a pull request to add it to the list:

* [eel-stream](http://github.com/BetSmartMedia/node-eel-stream) - Write logs to a
  stream (file, tcp socket, whatever) using a formatter function.
* [eel-amqp](http://github.com/BetSmartMedia/node-eel-amqp) - Send logs to an AMQP
  server.

## TODO

Investigate using EventEmitter2 for namespacing and pattern matching log events.

[EventEmitter]: (http://nodejs.org/api/events.html#events_class_events_eventemitter)
