var Action = require('../action')
var Self = function (p) {
  var self = this

  self.id = 'viewList'
  self._label = 'View List'
}
Self.prototype = Object.create(Action.prototype)

Self.prototype.execute = function() {
  var self = this
  G.listView.toggle()
}

module.exports = Self
