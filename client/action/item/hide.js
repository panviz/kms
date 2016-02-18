var Action = require('../../action')
var Self = function (p) {
  var self = this

  self.id = 'itemHide'
  self._label = 'Hide item'
}
Self.prototype = Object.create(Action.prototype)

Self.prototype.execute = function () {
  var self = this
  var keys = G.selection.getAll()
  G.visibleItems.remove(keys)
}

module.exports = Self
