log = require('./')
assert = require('assert')
p = console.log

p('1..4')

infoOnce = false
pass = true

process.nextTick(function(){ log('blah') })
log.once('info', function(){ infoOnce = true })

setTimeout(function(){
	if (infoOnce) {
		p('ok - .info is called by default')
	} else {
		p('not ok - .info was not called')
		pass = false
	}

	log.on('info', function(entry){
		if (entry.wasModified) {
			p('ok - entries can be modified by listeners')
		} else {
			p('not ok - entry was not modified by listener')
		}
	})

	log.on('entry', function(entry) {
		if (entry.timestamp) {
			p('ok - entry has a timestamp')
		} else {
			p('not ok - entry has no timestamp')
		}
		if (entry.level) {
			p('ok - entry has a level')
		} else {
			p('not ok - entry has no level')
		}
	})

	log.first('entry', function(entry) {
		entry.wasModified = true
	})

	log('sup dawg')
}, 100)


