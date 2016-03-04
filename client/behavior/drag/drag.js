/*
 * Drag behavior
 */
var Behavior = require('../Behavior')
, Util = require('../../../core/util')

/**
 * self._dragged - node on which dragging started
 * self._draggedClone - copy of the node on which dragging started - to visualize dragging
 * self._target - node on which dragged node is dropped
 */
var Self = function (p) {
  Behavior.call(this, p)
  var self = this

  self.container = p.container
}
Self.prototype = Object.create(Behavior.prototype)

Self.prototype.enable = function () {
  var self = this
  self.container.on('mousedown', self.p.node.selector, self._start.bind(self))
  self.container.on('mousemove', self._run.bind(self))
  self.container.on('mouseenter', self.p.node.selector, self._prepareDrop.bind(self))
  self.container.on('mouseleave', self.p.node.selector, self._disposeDrop.bind(self))
  self.container.on('mouseup', self.p.node.selector, self._end.bind(self))
  self.container.on('mouseup', self._end.bind(self))
  self.container.addClass('drag')
  self._enabled = true
}

Self.prototype.disable = function () {
  var self = this
  self.container.off('mousedown', self._start)
  self.container.off('mousemove', self._run)
  self.container.off('mouseenter', self._prepareDrop)
  self.container.off('mouseleave', self._disposeDrop)
  self.container.off('mouseup', self._end)
  self.container.off('mouseup', self._end)
  self.container.removeClass('drag')
}
// TODO show all selected nodes while dragging?
Self.prototype._start = function (e) {
  var self = this
  self._dragged = $(e.currentTarget)
  self._draggedClone = self._dragged.clone().addClass('dragging')
  self._startPoint = {x: e.offsetX, y: e.offsetY}

  self.container.append(self._draggedClone)
  self.container.addClass('in-progress')
  self._inProgress = true
}

Self.prototype._run = function (e) {
  var self = this
  if (!self._inProgress) return
  if ( Math.abs(e.offsetX - self._startPoint.x) < 2 &&
       Math.abs(e.offsetY - self._startPoint.y) < 2) return

  if (!self._draggedClone.is(':visible')) {
    self._draggedClone.show()
  } 
  self._draggedClone.translate(e.offsetX, e.offsetY)
}

Self.prototype._prepareDrop = function (e) {
  var self = this
  if (!self._inProgress) return

  // restrict self dropping
  if (e.currentTarget === self._dragged[0]) return
  self._target = $(e.currentTarget)
  self._target.addClass('dropTarget')
}

Self.prototype._disposeDrop = function (e) {
  var self = this
  if (!self._inProgress || !self._target) return
  self._target.removeClass('dropTarget')
  self._target = undefined
}

Self.prototype._end = function (e) {
  var self = this
  if (!self._inProgress) return

  var target = {}
  if (self._target) {
    self.trigger('drop', self._target)
  } else {
    var delta = {}
    delta.x = e.offsetX - self._startPoint.x
    delta.y = e.offsetY - self._startPoint.y
    
    var nodeHalfWidth = self.p.node.size.width/2
    if (Math.abs(delta.x) > nodeHalfWidth || Math.abs(delta.y) > nodeHalfWidth) {
      self.trigger('move', delta)
    }
  }

  self._startPoint = undefined
  self._disposeDrop()
  self._draggedClone.remove()
  self.container.removeClass('in-progress')
  self._inProgress = false
}

module.exports = Self
