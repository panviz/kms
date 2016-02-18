var Action = require('../../../action')
var Self = function (p) {
  Action.call(this, p)
  var self = this
  self.id = 'graphFixItemPosition'
  self._label = 'Fix Item Position'
}
Self.prototype = Object.create(Action.prototype)

Self.prototype.execute = function () {
}

module.exports = new Self
