var Action = require('../../action')
var Self = function (p) {
  Action.call(this, p)
  var self = this

  self.id = 'itemEdit'
  self._label = 'Edit item'
  self._icon = 'fa fa-pencil-square-o'
  self.group = 'item'
}
Self.prototype = Object.create(Action.prototype)

Self.prototype.execute = function () {
  var self = this
  var keys = self.app.selection.getAll()
  self.app.editItem(keys[0])
}

Self.prototype.evaluate = function (selection) {
  var self = this
  if (_.isEmpty(selection.getAll())) self.disable()
  else self.enable()
}

module.exports = new Self
