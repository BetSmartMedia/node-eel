var safeJSON = require('../formatter').safeJSON

module.exports = function (stream) {
	function handler (entry) {
		var output = safeJSON(entry)
		if (!output) return
		stream.write(output)
	}
	handler.end = function () { stream.writable && stream.end() }
	return handler
}
