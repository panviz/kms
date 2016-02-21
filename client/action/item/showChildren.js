var Action = require('../../action')
var Self = function (p) {
  Action.call(this, p)
  var self = this

  self.id = 'itemShowChildren'
  self._label = 'Show Children'
  self._icon = 'fa fa-plus-circle'
  self.group = 'item'
}
Self.prototype = Object.create(Action.prototype)

Self.prototype.execute = function () {
  var self = this
  var keys = self.app.selection.getAll()
  self.app.showChildren(keys)
}

Self.prototype.evaluate = function (selection) {
  var self = this
  if (_.isEmpty(selection.getAll())) self.disable()
  else self.enable()
}

module.exports = new Self
