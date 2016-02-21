var Action = require('../action')
var Self = function (p) {
  Action.call(this, p)
  var self = this

  self.id = 'showLinkedList'
  self._label = 'Linked Items List'
  self.group = 'item'
}
Self.prototype = Object.create(Action.prototype)

Self.prototype.execute = function () {
  var self = this
  self.app.linkedList.toggle()
}

module.exports = new Self
