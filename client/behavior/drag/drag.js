/*
 * Drag behavior
 */
import Behavior from '../behavior'
import './drag.scss'

/**
 * this._dragged - node on which dragging started
 * this._draggedClone - copy of the node on which dragging started - to visualize dragging
 * this._target - node on which dragged node is dropped
 */
export default class Drag extends Behavior {
  constructor (p) {
    super(p)
    this.container = p.container
    this.nodeGroup = p.nodeGroup
  }

  enable () {
    super.enable()
    this.container.on('mousedown', this.p.node.selector, this._start.bind(this))
    this.container.on('mousemove', this._run.bind(this))
    this.container.on('mouseenter', this.p.node.selector, this._prepareDrop.bind(this))
    this.container.on('mouseleave', this.p.node.selector, this._disposeDrop.bind(this))
    this.container.on('mouseup', this.p.node.selector, this._end.bind(this))
    this.container.on('mouseup', this._end.bind(this))
    this.container.addClass('drag')
  }

  disable () {
    super.disable()
    this.container.off('mousedown', this._start)
    this.container.off('mousemove', this._run)
    this.container.off('mouseenter', this._prepareDrop)
    this.container.off('mouseleave', this._disposeDrop)
    this.container.off('mouseup', this._end)
    this.container.off('mouseup', this._end)
    this.container.removeClass('drag')
  }
  /**
   * TODO show all selected nodes while dragging?
   */
  _start (e) {
    this._dragged = $(e.currentTarget)
    this._draggedClone = this._dragged.clone().addClass('dragging')
    this._startPoint = { x: e.pageX, y: e.pageY }

    this.container.append(this._draggedClone)
    this.container.addClass('in-progress')
    this._inProgress = true
  }

  _run (e) {
    if (!this._inProgress) return
    if (Math.abs(e.pageX - this._startPoint.x) < 2 &&
        Math.abs(e.pageY - this._startPoint.y) < 2) return

    if (!this._draggedClone.is(':visible')) {
      this._draggedClone.show()
    }
    // todo remove magic numbers
    this._draggedClone.translate(e.pageX - 50, e.pageY - 6)
  }

  _prepareDrop (e) {
    if (!this._inProgress) return

    // restrict this dropping
    if (e.currentTarget === this._dragged[0]) return
    this._target = $(e.currentTarget)
    this._target.addClass('dropTarget')
  }

  _disposeDrop (e) {
    if (!this._inProgress || !this._target) return
    this._target.removeClass('dropTarget')
    this._target = undefined
  }

  _end (e) {
    if (!this._inProgress) return

    if (this._target) {
      this.trigger('drop', this._target)
    } else {
      const delta = {}
      delta.x = e.pageX - this._startPoint.x
      delta.y = e.pageY - this._startPoint.y

      const nodeHalfWidth = this.p.node.size.width / 2
      if (Math.abs(delta.x) > nodeHalfWidth || Math.abs(delta.y) > nodeHalfWidth) {
        this.trigger('move', delta)
      }
    }

    this._startPoint = undefined
    this._disposeDrop()
    this._draggedClone.remove()
    this.container.removeClass('in-progress')
    this._inProgress = false
  }
}
