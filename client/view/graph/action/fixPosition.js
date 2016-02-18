var Action = require('../../../action')
var Self = function () {
  var self = this
  self.id = 'graphFixItemPosition'
  self._label = 'Fix Item Position'
}
Self.prototype = Object.create(Action.prototype)

Self.prototype.execute = function () {
}

module.exports = Self
