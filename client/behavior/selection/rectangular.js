/*
 * Rectangular selection
 */
var Behavior = require('../behavior')
, Util = require('../../../core/util')

var Self = function (p) {
  Behavior.call(this, p)
  var self = this

  self.selection = p.selection
  self._nodes = p.nodes
  self.container = p.container
  self._eventTarget = p.eventTarget
  self._element = $('<div class="selectioningRectangle"></div>')
  self.container.append(self._element)

  self._rect = {topLeftPoint: {}}
}
Self.prototype = Object.create(Behavior.prototype)

Self.prototype.enable = function () {
  var self = this
  self._eventTarget.on('mousedown', self._start.bind(self))
  self._eventTarget.on('mousemove', self._run.bind(self))
  self._eventTarget.on('mouseup', self._end.bind(self))
  self._enabled = true
}

Self.prototype.disable = function () {
  var self = this
  self._eventTarget.off('mousedown', self._start.bind(self))
  self._eventTarget.off('mousemove', self._run.bind(self))
  self._eventTarget.off('mouseup', self._end.bind(self))
  self._enabled = false
}
/**
 * user starts drawing rectangular over items
 */
Self.prototype._start = function (e) {
  var self = this
  if (!self._enabled) return
  self._inProgress = true

  if (e.shiftKey === false) self.selection.clear()

  var rect = self._rect
  rect.startPoint = {}
  rect.startPoint.x = e.clientX
  rect.startPoint.y = e.clientY

  self._element.show()
}
/**
 * user is drawing rectangular over items
 */
Self.prototype._run = function (e) {
  var self = this
  if (!self._inProgress) return

  var rect = self._rect
  rect.width = Math.abs(rect.startPoint.x - e.clientX)
  rect.height = Math.abs(rect.startPoint.y - e.clientY)
  rect.topLeftPoint = {}
  rect.topLeftPoint.x = Math.min(rect.startPoint.x, e.clientX)
  rect.topLeftPoint.y = Math.min(rect.startPoint.y, e.clientY)

  self._element.cssInt('left', rect.topLeftPoint.x)
  self._element.cssInt('top', rect.topLeftPoint.y)
  self._element.cssInt('width', rect.width)
  self._element.cssInt('height', rect.height)
}
/**
 * user finished drawing rectangular of items to select
 */
Self.prototype._end = function (e) {
  var self = this
  if (!self._enabled || !self._inProgress) return
  self._inProgress = false

  // reset visual selectioning rectangle
  var rect = self._rect
  self._element.cssInt('top', 0)
  self._element.cssInt('left', 0)
  self._element.cssInt('width', 0)
  self._element.cssInt('height', 0)
  self._element.hide()

  // TODO replace global object usage
  var toSelect = _.map(G.graphView._nodes[0], function(node){
    if (self._isNodeSelected(node)) return node.__data__
  })
  self.selection.add(toSelect)
  rect.width = rect.height = 0
}
/**
 * @param node Node
 */
Self.prototype._isNodeSelected = function (node) {
  var self = this
  var nodeBounding = node.getBoundingClientRect()
  var nodeCenter = {}
  nodeCenter.x = nodeBounding.left + nodeBounding.width/2
  nodeCenter.y = nodeBounding.top + nodeBounding.height/2
  var rect = {left: self._rect.topLeftPoint.x
    , top: self._rect.topLeftPoint.y
    , right: self._rect.topLeftPoint.x + self._rect.width
    , bottom: self._rect.topLeftPoint.y + self._rect.height 
  }

  return Util.pointInRectangle(nodeCenter, rect)
}

module.exports = Self
