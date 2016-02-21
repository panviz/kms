var Action = require('../../action')
var Self = function (p) {
  Action.call(this, p)
  var self = this

  self.id = 'itemHide'
  self._label = 'Hide item'
  self._icon = 'fa fa-eye-slash'
  self.group = 'item'
}
Self.prototype = Object.create(Action.prototype)

Self.prototype.execute = function () {
  var self = this
  var keys = self.app.selection.getAll()
  self.app.visibleItems.remove(keys)
}

Self.prototype.evaluate = function (selection) {
  var self = this
  if (_.isEmpty(selection.getAll())) self.disable()
  else self.enable()
}

module.exports = new Self
