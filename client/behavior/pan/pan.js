/**
 * Moving of nodes canvas
 * @event change fires on every little move
 * @event end fires on finishing move
 */
import Behavior from '../behavior'
/**
 * _startPoint - coordinates of pointing device relative to the canvas
 * @param Number p.wheelStep pixels to move on mouse wheel
 * @param Number p.keyStep pixels to move on keyboard arrows
 */
export default function Self (p) {
  Behavior.call(this, p)

  this.p = _.extend({
    wheelStep: 10,
    keyStep: 30,
  }, p)
  this._controlKeys = ['Up', 'Down', 'Left', 'Right']
  this._startPoint = {}
  this._changed = false

  this.container = p.container
  this._element = p.panElement
  $(document).on('keydown', this._onKeyDown.bind(this))
}
Self.prototype = Object.create(Behavior.prototype)

Self.prototype.enable = function () {
  this.container.on('mousedown', this._onMouseDown.bind(this))
  this.container.on('mousemove', this._onMouseMove.bind(this))
  this.container.on('mouseup', this._end.bind(this))
  this.container.on('mousewheel', this._onScroll.bind(this))
  this.container.addClass('pan')
  this._enabled = true
}

Self.prototype.disable = function () {
  this.container.off('mousedown', this._onMouseDown)
  this.container.off('mousemove', this._onMouseMove)
  this.container.off('mouseup', this._end)
  this.container.off('mousewheel', this._onScroll)
  this.container.removeClass('pan')
  this._enabled = false
}
/**
 * @return {x,y} current canvas absolute position
 */
Self.prototype.getPosition = function () {
  const pos = {}
  pos.x = _.toNumber(this._element.translateX())
  pos.y = _.toNumber(this._element.translateY())
  return pos
}
/**
 * Move canvas either absolute or relative
 */
Self.prototype.move = function (x, y, relative, silent) {
  if (relative) {
    this._moveOn(x, y)
  } else {
    this._moveTo(x, y, silent)
  }
  if (!silent) this.trigger('end')
}
/**
 * shift canvas on specified distance {deltaX, deltaY}
 */
Self.prototype._moveOn = function (deltaX, deltaY) {
  const current = this.getPosition()
  this._moveTo(current.x + deltaX, current.y + deltaY)
}
/**
 * Move canvas to absolute position {x,y}
 */
Self.prototype._moveTo = function (x, y, silent) {
  if (y !== undefined) this._element.translateY(y)
  if (x !== undefined) this._element.translateX(x)
  if (!silent) this.trigger('change')
}
/**
 * Sets this._startPoint
 * @param Number x absolute window coordinate where movement starts
 * @param Number y absolute window coordinate where movement starts
 */
Self.prototype._start = function (x, y, force) {
  if (!this._enabled) return
  this._inProgress = true
  this._changed = false
  const current = this.getPosition()

  this._startPoint.x = x - current.x
  this._startPoint.y = y - current.y
}

Self.prototype._run = function (x, y) {
  if (!this._inProgress) return

  // Ignore small shift
  const current = this.getPosition()
  if (Math.abs(x - this._startPoint.x - current.x) < 2 &&
       Math.abs(y - this._startPoint.y - current.y) < 2) {
    return
  }

  this._changed = true
  const posX = x - this._startPoint.x
  const posY = y - this._startPoint.y
  this._moveTo(posX, posY)
}

Self.prototype._end = function () {
  if (this._inProgress && this._changed) {
    this.trigger('end')
  }
  this._inProgress = false
  this._changed = false
}

Self.prototype._onMouseDown = function (e) {
  if (e.target !== e.currentTarget) return
  this._start(e.pageX, e.pageY)
}

Self.prototype._onMouseMove = function (e) {
  this._run(e.pageX, e.pageY)
}

Self.prototype._onScroll = function (e) {
  let turnOff = false
  if (!this._enabled) {
    this._enabled = true
    turnOff = true
  }
  this._start(0, 0)
  if (e.shiftKey) {
    this._run(-e.wheelDeltaX / this.p.wheelStep, -e.wheelDeltaY / this.p.wheelStep)
  } else {
    this._run(e.wheelDeltaX / this.p.wheelStep, e.wheelDeltaY / this.p.wheelStep)
  }
  this._end()
  if (turnOff) this._enabled = false
}

Self.prototype._onKeyDown = function (e) {
  e = e.originalEvent // eslint-disable-line
  if (!('keyIdentifier' in e)) {
    e.keyIdentifier = e.key // eslint-disable-line
  }
  if (!_.includes(this._controlKeys, e.keyIdentifier)) return

  let turnOff = false
  if (!this._enabled) {
    this._enabled = true
    turnOff = true
  }
  this._start(0, 0)

  switch (e.keyIdentifier) {
  case 'Up':
    this._run(0, -this.p.keyStep)
    break
  case 'Down':
    this._run(0, this.p.keyStep)
    break
  case 'Left':
    this._run(-this.p.keyStep, 0)
    break
  case 'Right':
    this._run(this.p.keyStep, 0)
    break
  default:
  }
  this._end()
  if (turnOff) this._enabled = false
}
