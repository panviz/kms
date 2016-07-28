/*
 * Rectangular selection
 */
import Behavior from '../behavior'
import Util from '../../../core/util'

export default function Self (p) {
  Behavior.call(this, p)

  this.selection = p.selection
  this._nodes = p.nodes
  this.container = p.container
  this._eventTarget = p.eventTarget
  this._element = $('<div class="selectioningRectangle"></div>')
  this.container.append(this._element)

  this._rect = { topLeftPoint: {} }
}
Self.prototype = Object.create(Behavior.prototype)

Self.prototype.enable = function () {
  this._eventTarget.on('mousedown', this._start.bind(this))
  this._eventTarget.on('mousemove', this._run.bind(this))
  this._eventTarget.on('mouseup', this._end.bind(this))
  this._enabled = true
}

Self.prototype.disable = function () {
  this._eventTarget.off('mousedown', this._start.bind(this))
  this._eventTarget.off('mousemove', this._run.bind(this))
  this._eventTarget.off('mouseup', this._end.bind(this))
  this._enabled = false
}
/**
 * user starts drawing rectangular over items
 */
Self.prototype._start = function (e) {
  if (!this._enabled) return
  this._inProgress = true

  if (e.shiftKey === false) this.selection.clear()

  const rect = this._rect
  rect.startPoint = {}
  rect.startPoint.x = e.clientX
  rect.startPoint.y = e.clientY

  this._element.show()
}
/**
 * user is drawing rectangular over items
 */
Self.prototype._run = function (e) {
  if (!this._inProgress) return

  const rect = this._rect
  rect.width = Math.abs(rect.startPoint.x - e.clientX)
  rect.height = Math.abs(rect.startPoint.y - e.clientY)
  rect.topLeftPoint = {}
  rect.topLeftPoint.x = Math.min(rect.startPoint.x, e.clientX)
  rect.topLeftPoint.y = Math.min(rect.startPoint.y, e.clientY)

  this._element.cssInt('left', rect.topLeftPoint.x)
  this._element.cssInt('top', rect.topLeftPoint.y)
  this._element.cssInt('width', rect.width)
  this._element.cssInt('height', rect.height)
}
/**
 * user finished drawing rectangular of items to select
 */
Self.prototype._end = function (e) {
  if (!this._enabled || !this._inProgress) return
  this._inProgress = false

  // reset visual selectioning rectangle
  const rect = this._rect
  this._element.cssInt('top', 0)
  this._element.cssInt('left', 0)
  this._element.cssInt('width', 0)
  this._element.cssInt('height', 0)
  this._element.hide()

  // TODO replace global object usage
  const toSelect = _.map(G.graphView._nodes[0], (node) => {
    if (this._isNodeSelected(node)) return node.__data__
    return undefined
  })
  this.selection.add(toSelect)
  rect.width = rect.height = 0
}
/**
 * @param node Node
 */
Self.prototype._isNodeSelected = function (node) {
  const nodeBounding = node.getBoundingClientRect()
  const nodeCenter = {}
  nodeCenter.x = nodeBounding.left + nodeBounding.width / 2
  nodeCenter.y = nodeBounding.top + nodeBounding.height / 2
  const rect = {
    left: this._rect.topLeftPoint.x,
    top: this._rect.topLeftPoint.y,
    right: this._rect.topLeftPoint.x + this._rect.width,
    bottom: this._rect.topLeftPoint.y + this._rect.height,
  }

  return Util.pointInRectangle(nodeCenter, rect)
}
