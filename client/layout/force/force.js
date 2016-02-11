/**
 * Force directed layout
 */
var Self = function (p) {
  var self = this
  self.p = p || {}

  self.force = d3.layout.force()
    .charge(-400)
    .linkDistance(150)
    //.charge(-220)
    //.linkDistance(40)
    .gravity(0)
    .size([self.p.width, self.p.height])

  self.animation = self.force

  self.force.on('tick', self._boundConstraint.bind(self))
}

Self.prototype.setup = function (items, links) {
  var self = this
  // nodes should appear near the center but not too close to not repel strongly
  for (var i = 0; i < items.length; i++) {
    items[i].x = items[i].x || Math.random() * self.p.width/10 + self.p.width/2 - self.p.width/20
    items[i].y = items[i].y || Math.random() * self.p.height/10 + self.p.height/2 - self.p.height/20
  }
  self._items = items
  self._links = links
  self.force
    .nodes(items)
    .links(links)
}

Self.prototype.position = function () {
  var self = this
  self.force.start()
  for (var i = 1000; i > 0; --i) self.force.tick()
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
    d.x = Math.max(15, Math.min(self.p.width - 15, d.x))
    d.y = Math.max(15, Math.min(self.p.height - 15, d.y))
  })
}

module.exports = Self
