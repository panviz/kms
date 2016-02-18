var Action = require('../../action')
var Self = function (p) {
  var self = this

  self.id = 'itemShowChildren'
  self._label = 'Show Children'
}
Self.prototype = Object.create(Action.prototype)

Self.prototype.execute = function () {
  var self = this
  var keys = G.selection.getAll()
  G.showChildren(keys)
}

module.exports = Self
