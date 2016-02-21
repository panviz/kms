var Action = require('../../action')
var Self = function (p) {
  Action.call(this, p)
  var self = this

  self.id = 'itemCreate'
  self._label = 'Create item'
  self._deny = false
  self._icon = 'fa fa-square-o'
  self.group = 'item'
}
Self.prototype = Object.create(Action.prototype)

Self.prototype.execute = function () {
  var self = this
  self.app.provider.request('set')
    .then(function (key) {
      self.app.visibleItems.add(key)
    })
}

module.exports = new Self
