/*
 * Selection by click
 * allows multiple
 */
import Behavior from '../behavior'
import Util from '../../../core/util'

export default function Self(p) {
  Behavior.call(this, p)
  var self = this
  self.modeKey = 'ctrlKey'

  self.selection = p.selection
  self.container = p.container
  self._nodeSelector = p.nodeSelector
  self.container.on('mousedown', self._nodeSelector, self._onMouseDownNode.bind(self))
  self.container.on('mouseup', self._nodeSelector, self._onMouseUpNode.bind(self))
  self.container.on('mousedown', self._onMouseDownBase.bind(self))
}
Self.prototype = Object.create(Behavior.prototype)

Self.prototype._onMouseDownBase = function (e) {
  var self = this
  if (e.target !== e.currentTarget) return
  if (e[self.modeKey] === false) self.selection.clear()
}

Self.prototype._onMouseDownNode = function (e) {
  var self = this
  var key = e.currentTarget.__data__

  if ( e[self.modeKey] === false ) {
    self.selection.add(key)
  } else {
    if (self.selection.get(key)) {
      self.selection.remove(key)
    } else {
      self.selection.add(key)
    }
  }
}

Self.prototype._onMouseUpNode = function (e) {
  var self = this
  var key = e.currentTarget.__data__
  var selected = self.selection.getAll()

  // deselect all except current
  if (e[self.modeKey] === false) {
    var unselect = _.without(selected, key)
    self.selection.remove(unselect)
  }
}
