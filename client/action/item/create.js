var Action = require('../../action')
var Self = function (p) {
  Action.call(this, p)
  var self = this

  self.id = 'itemCreate'
  self._label = 'Create'
  self._deny = false
  self._icon = 'fa fa-square-o'
  self.group = 'item'
}
Self.prototype = Object.create(Action.prototype)

Self.prototype.execute = function () {
  var self = this
  self.registrar.provider.request('set')
    .then(function (key) {
      self.registrar.visibleItems.add(key)
    })
}

module.exports = Self
