/*
 * Selection by click
 * allows multiple
 */
import Behavior from '../behavior'

export default function Self (p) {
  Behavior.call(this, p)
  this.modeKey = 'ctrlKey'

  this.selection = p.selection
  this.container = p.container
  this._nodeSelector = p.nodeSelector
  this.container.on('mousedown', this._nodeSelector, this._onMouseDownNode.bind(this))
  this.container.on('mouseup', this._nodeSelector, this._onMouseUpNode.bind(this))
  this.container.on('mousedown', this._onMouseDownBase.bind(this))
}
Self.prototype = Object.create(Behavior.prototype)

Self.prototype._onMouseDownBase = function (e) {
  if (e.target !== e.currentTarget) return
  if (e[this.modeKey] === false) this.selection.clear()
}

Self.prototype._onMouseDownNode = function (e) {
  const key = e.currentTarget.__data__

  if (e[this.modeKey] === false) {
    this.selection.add(key)
  } else {
    if (this.selection.get(key)) {
      this.selection.remove(key)
    } else {
      this.selection.add(key)
    }
  }
}

Self.prototype._onMouseUpNode = function (e) {
  const key = e.currentTarget.__data__
  const selected = this.selection.getAll()

  // deselect all except current
  if (e[this.modeKey] === false) {
    const unselect = _.without(selected, key)
    this.selection.remove(unselect)
  }
}
