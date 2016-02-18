var Action = require('../../action')
var Self = function (p) {
  var self = this

  self.id = 'itemCreate'
  self._label = 'Create item'
}
Self.prototype = Object.create(Action.prototype)

Self.prototype.execute = function () {
  var self = this
  G.provider.request('set')
    .then(function (key) {
      G.visibleItems.add(key)
    })
}

module.exports = Self
