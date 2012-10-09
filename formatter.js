traverse = require('traverse')

exports.safeJSON = safeJSON

function safeJSON (obj) {
  var scrubbed = traverse(obj).map(function () {
    if (this.circular) this.update(this.path.join('.'))
  })
  var string = JSON.stringify(scrubbed)
  if (string) string += "\n";
  return string
}
