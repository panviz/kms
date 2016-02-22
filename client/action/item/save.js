var Action = require('../../action')
var Self = function (p) {
  Action.call(this, p)
  var self = this
  self.id = 'itemSave'
  self._label = 'Save'
  self._deny = true
  self._icon = 'fa fa-save'
  self.group = 'item'

  self.registrar.editor.on('change', self.evaluate.bind(self))
}
Self.prototype = Object.create(Action.prototype)

Self.prototype.execute = function () {
  var self = this
  self.registrar.saveItem()
}

Self.prototype.evaluate = function () {
  var self = this
  if (self.registrar.editor && self.registrar.editor.isChanged()) self.enable()
  else self.disable()
}

module.exports = Self
