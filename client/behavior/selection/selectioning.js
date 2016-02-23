/*
 * Rectangular selection
 */
var Behavior = require('../behavior')
, Util = require('../../../core/util')

var Self = function (p) {
  Behavior.call(this, p)
  var self = this

  self.selection = p.selection
  self._eventTarget = p.container
  self._nodeSelector = p.nodeSelector
  self._eventTarget.on('mousedown', self._nodeSelector, self._onMouseDownNode.bind(self))
  self._eventTarget.on('mouseup', self._nodeSelector, self._onMouseUpNode.bind(self))
  self._eventTarget.on('mousedown', self._onMouseDownBase.bind(self))
}
Self.prototype = Object.create(Behavior.prototype)

Self.prototype._onMouseDownBase = function (e) {
  var self = this
  if (e.shiftKey === false) self.selection.clear()
}

Self.prototype._onMouseDownNode = function (e) {
  var self = this
  var key = e.currentTarget.__data__.key

  if( e.shiftKey === false ) {
    self.selection.add(key)
  } else {
    if (self.selection.get(key)) {
      self.selection.remove(key)
    } else {
      self.selection.add(key)
    }
  }
  e.stopPropagation()
}

Self.prototype._onMouseUpNode = function (e) {
  var self = this
  var key = e.currentTarget.__data__.key
  var selected = self.selection.getAll()

  // do not clear selection when dragging
  if (!self.selection.get(key)) return

  // deselect all except current
  if (e.shiftKey === false) {
    var unselect = _.without(selected, key)
    self.selection.remove(unselect)
  }
}

module.exports = Self
