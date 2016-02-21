/**
 * Force directed layout
 */
var Layout = require('./layout')

var Self = function (p) {
  Layout.call(this, p)
  var self = this

  self.force = d3.layout.force()
    .charge(-400)
    .linkDistance(150)
    //.charge(-220)
    //.linkDistance(40)
    .gravity(0)
    .size([self.width, self.height])

  self.animation = self.force

  self.force.on('tick', self._boundConstraint.bind(self))
}
Self.prototype = Object.create(Layout.prototype)

Self.prototype.setup = function (items, links) {
  var self = this
  // nodes should appear near the center but not too close to not repel strongly
  for (var i = 0; i < items.length; i++) {
    items[i].x = items[i].x || Math.random() * self.width/10 + self.width/2 - self.width/20
    items[i].y = items[i].y || Math.random() * self.height/10 + self.height/2 - self.height/20
  }
  self._items = items
  self.force
    .nodes(items)
    .links(links)
}

Self.prototype.size = function (width, height) {
  var self = this
  self.width = width
  self.height = height
  self.force.size([self.width, self.height])
}

Self.prototype.run = function () {
  var self = this
  self.force.start()
  for (var i = 100000; i > 0; --i) self.force.tick()
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
