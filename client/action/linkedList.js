var Action = require('../action')
var Self = function (p) {
  var self = this

  self.id = 'showLinkedList'
  self._label = 'Linked Items List'
}
Self.prototype = Object.create(Action.prototype)

Self.prototype.execute = function () {
  var self = this
  G.linkedList.toggle()
}

module.exports = Self
