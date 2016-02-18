var Action = require('../../action')
var Self = function (p) {
  var self = this

  self.id = 'itemEdit'
  self._label = 'Edit item'
}
Self.prototype = Object.create(Action.prototype)

Self.prototype.execute = function () {
  var self = this
  var keys = G.selection.getAll()
  G.editItem(keys[0])
}

module.exports = Self
