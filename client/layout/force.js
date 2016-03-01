/**
 * Force directed layout
 */
var Layout = require('./layout')
, webcola = require('webcola')

var Self = function (p) {
  Layout.call(this, p)
  var self = this
  self.name = "Force directed"

  self.force = webcola.d3adaptor()
    .linkDistance(100)
    //.charge(-400)
    //.gravity(0)
    //.constraints([{axis: "y", left: 0, right: 1, gap: 25}])
    //.avoidOverlaps(true)
    //.symmetricDiffLinkLengths(30)
    .size([self.width, self.height])

  self.animation = self.force

  //self.force.on('tick', self._boundConstraint.bind(self))
}
Self.prototype = Object.create(Layout.prototype)

Self.prototype.size = function (width, height) {
  var self = this
  self.width = width
  self.height = height
  self.force.size([self.width, self.height])
}

Self.prototype.run = function (items, links) {
  var self = this
  // nodes should appear near the center but not too close to not repel strongly
  self._items = items
  self.force
    .nodes(items)
    .links(links)

  // do not use unconstraint iterations if view is updated on every tick
  // self.force.start(10,15,20)
  self.force.start()
  for (var i = 100; i > 0; --i) self.force.tick()
  self.force.stop()
}

Self.prototype.setAnimationHandler = function (func) {
  var self = this
  var handler
  if (func) {
    handler = function () {
      func()
      self._boundConstraint()
    }
  } else {
    handler = function () {
      self._boundConstraint()
    }
  }
  self.force.on('tick', handler.bind(self))
}

Self.prototype._boundConstraint = function () {
  var self = this
  _.each(self._items, function (d) {
    d.x = Math.max(15, Math.min(self.width - 15, d.x))
    d.y = Math.max(15, Math.min(self.height - 15, d.y))
  })
}

module.exports = Self
