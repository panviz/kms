/**
 * Force directed layout
 * with constraints implemented with WebCola to decrease jitter and avoid nodes overlap
 * perform additional transition animation to decrease jitter
 */
import Layout from './layout'
import webcola from 'webcola'
import Util from '../../core/util'

export default function Self(p) {
  Layout.call(this, p)
  var self = this
  self.name = 'Force directed'
  self.p.iterations = p.iterations || [10, 15, 20]
  self.p.untangleIterations = self.p.iterations[0] + self.p.iterations[1]
  self.p.animationDuration = 750
  self._transitionStarted

  self._items = []
  self._shapes = []
}
Self.prototype = Object.create(Layout.prototype)
/**
 * change layout desired size
 */
Self.prototype.size = function (width, height) {
  var self = this
  self.width = width
  self.height = height
  return self._force.size([self.width, self.height])
}
/**
 * in order for seamless position transition
 * update new items - existing shapes correspondence for items which remain from previous run
 * init position and size for new nodes
 */
Self.prototype.update = function (graph, enteredNodes) {
  var self = this

  // recreate new adaptor due to https://github.com/tgdwyer/WebCola/wiki/Troubleshooting
  self._force = webcola.d3adaptor()
    .linkDistance(100)
    .avoidOverlaps(true)
    .size([self.width, self.height])

  //self._force.on('tick', self._boundConstraint.bind(self))
  self._force.on('tick', self._onTick.bind(self))
  self._force.on('end', self._onEnd.bind(self))
  var newItems = graph.getItemKeys()
  var links = graph.getLinksArray()
  var newShapes = []
  _.each(newItems, function (newItem, index) {
    var existIndex = self._items.indexOf(newItem)
    if (existIndex > -1) {
      newShapes[index] = self._shapes[existIndex]
    } else {
      var node = _.find(enteredNodes, {__data__: newItem})
      var size = node.getBBox()
      var point = self._initPosition(newItem, graph)
      newShapes[index] = {
        index: index,
        x: point[0],
        y: point[1],
        px: point[0],
        py: point[1],
        width: size.width + self.p.node.gap,
        height: size.height + self.p.node.gap,
      }
    }
  })
  self._items = newItems
  self._shapes = newShapes

  // TODO
  self._shapeLinks = _.map(links, function (link) {
    var source = self._shapes[self._items.indexOf(link[0])]
    var target = self._shapes[self._items.indexOf(link[1])]
    return {
      source: source,
      target: target,
    }
  })

  self._force
    .nodes(self._shapes)
    .links(self._shapeLinks)
}
/**
 * @param Number p.duration desired maximum time in milliseconds to run layout
 * no running time limit by default
 * @param Boolean untangle whether to run unconstrained iterations
 * true by default as this produces better visual result taking more time
 * @param Boolean transit whether to fire more ticks with smoothly interpolated positions
 * true by default as there usually would be a substantial shift with silent untangled iterations
 * set to false if you need only resulting layout after time elapsed
 */
Self.prototype.run = function (p) {
  var self = this
  p = p || {}
  self._forceCounter = 0
  self._startTime = new Date
  self._duration = p.duration
  self._doUntangle = _.isNil(p.untangle) ? true : p.untangle
  self._transitionEnabled = _.isNil(p.transit) ? true : p._transit

  // do not use unconstrainted iterations if view is updated on every tick
  if (self._doUntangle) self._force.start.apply(self._force, self.p.iterations)
  else self._force.start()
}
/**
 * @return Array of layouted items Coords
 */
Self.prototype.getCoords = function () {
  var self = this
  return _.map(self._shapes, function (shape) {
    var coord = {}
    coord.x = self._transitionStarted ? shape.tcx : shape.x
    coord.y = self._transitionStarted ? shape.tcy : shape.y
    return coord
  })
}
/**
 * @param Key item
 */
Self.prototype.fix = function (item) {
  var self = this
  var shape = self._shapes[self._items.indexOf(item)]
  shape.fixed = true
}
/**
 * @param Key item
 */
Self.prototype.move = function (item, delta) {
  var self = this
  var shape = self._shapes[self._items.indexOf(item)]
  shape.px = shape.x
  shape.py = shape.y
  shape.x = shape.x + delta.x
  shape.y = shape.y + delta.y
}
/**
 * on internal force layout iteration tick
 */
Self.prototype._onTick = function () {
  var self = this
  Util.log('F TICK ' + self._forceCounter)

  // if _duration is not set there is always time left to finish
  var timeLeft = self._duration ? self._duration - (new Date - self._startTime) : 1
  if (timeLeft < 0) self._force.stop()

  // untangle layout silently
  if (self._doUntangle && ++self._forceCounter < self.p.untangleIterations) return
  if (!self._transitionEnabled) {
    self.trigger('tick')
  } else {
    if (!self._transitionStarted) self._startTransition()
  }
}
/**
 * Called on force layout finished
 * start transition if it's not already running
 */
Self.prototype._onEnd = function () {
  var self = this
  Util.log('Force STOP')
  if (self._transitionEnabled && self._doUntangle && !self._transitionStarted) self._startTransition()
}

Self.prototype._endTransition = function (id) {
  var self = this
  Util.log('Transition STOP')
  cancelAnimationFrame(id)
  self._transitionStarted = undefined
  _.each(self._shapes, function (shape) {
    shape.px = shape.x
    shape.py = shape.y
  })
}
/**
 * @return Point of one visible linked node OR center of two OR centroid of polygon
 */
Self.prototype._initPosition = function (item, graph) {
  var self = this
  var allLinkedItems = graph.getLinked(item)
  var existLinkedItems = _.intersection(self._items, allLinkedItems)

  // nodes should appear near the center but not too close to not repel strongly
  if (_.isEmpty(existLinkedItems)) return [self.width / 2, self.height / 2]

  var points = _.map(existLinkedItems, function (existLinkedItem) {
    var shape = self._shapes[self._items.indexOf(existLinkedItem)]
    return [shape.x, shape.y]
  })
  return Util.centroid(points)
}

Self.prototype._startTransition = function (duration) {
  var self = this
  Util.log('Transition START')
  duration = duration || self.p.animationDuration

  function tick(timestamp) {
    if (!self._transitionStarted) self._transitionStarted = timestamp
    var progress = timestamp - self._transitionStarted
    if (progress < duration) {
       id = requestAnimationFrame(tick)
       self._makeTransition(progress, duration)
    } else {
      self._endTransition(id)
    }
  }
  var id = requestAnimationFrame(tick)
}
/**
 * calculate transition position for animation frame
 */
Self.prototype._makeTransition = function (progress, duration) {
  var self = this
  _.each(self._shapes, function (shape) {
    if (progress === 0) {
      shape.tpx = shape.px // Transition Previous X
      shape.tpy = shape.py
    }

    // Transition Current X
    shape.tcx = $.easing.easeInOutCubic(undefined, progress, shape.tpx, shape.x - shape.tpx, duration)
    shape.tcy = $.easing.easeInOutCubic(undefined, progress, shape.tpy, shape.y - shape.tpy, duration)
  })
  Util.log('T TICK')
  self.trigger('tick')
}
/**
 * lead to nodes overlap near boundaries
 */
Self.prototype._boundConstraint = function () {
  var self = this
  _.each(self._shapes, function (d) {
    d.x = Math.max(15, Math.min(self.width - 15, d.x))
    d.y = Math.max(15, Math.min(self.height - 15, d.y))
  })
}
