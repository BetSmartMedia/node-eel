var EventEmitter = require('events').EventEmitter
var emitter = new EventEmitter

module.exports = log

function log (type, data) {
	log.info(type, data)
};

['debug', 'info', 'warning', 'error', 'critical'].forEach(function(level){
	log[level] = function(type, data) {
		log.write(level, type, data)
	}
})

log.dateFormatter = function (d) { return d.toISOString() }

log.write = function (level, type, data) {
	data || (data = {})
	var entry = {
		type: type,
		level: level,
		timestamp: log.dateFormatter(new Date)
	}

	for (var k in data) entry[k] = data[k]

	log.emit('entry', entry)
	if (level === 'error') log.emit('error_', entry)
  else log.emit(level, entry)
}

log.emitter = emitter

log.first = function (event, handler) {
	emitter.listeners(event).unshift(handler)
}

// Expose all EventEmitter methods directly

emitterMethods = [
	'on',
	'addListener',
	'once',
	'removeListener',
	'removeAllListeners', 
	'setMaxListeners',
	'listeners',
	'emit'
]

emitterMethods.forEach(function (method) {
	log[method] = emitter[method].bind(emitter)
})
