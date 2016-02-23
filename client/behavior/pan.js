/**
 * Moving of nodes canvas
 * @event change fires on every little move
 * @event end fires on finishing move
 */
var Behavior = require('./behavior')
/**
 * _startPoint - coordinates of pointing device relative to the canvas
 * @param Number p.wheelStep pixels to move on mouse wheel
 * @param Number p.keyStep pixels to move on keyboard arrows
 */
var Self = function (p) {
  Behavior.call(this, p)
  var self = this

  self.p = _.extend({
    wheelStep: 10,
    keyStep:  30,
  }, p)
  self._controlKeys = ['Up', 'Down', 'Left', 'Right']
  self._startPoint = {}
  self._changed = false

  self.container = p.container
  self._eventTarget = p.eventTarget
  $(document).on('keydown', self._onKeyDown.bind(self))
}
Self.prototype = Object.create(Behavior.prototype)

Self.prototype.enable = function () {
  var self = this
  self._eventTarget.on('mousedown', self._onMouseDown.bind(self))
  self._eventTarget.on('mousemove', self._onMouseMove.bind(self))
  self._eventTarget.on('mouseup', self._end.bind(self))
  self._eventTarget.on('mousewheel', self._onScroll.bind(self))
  self._eventTarget.addClass('pan')
  self._enabled = true
}

Self.prototype.disable = function () {
  var self = this
  self._eventTarget.off('mousedown', self._onMouseDown)
  self._eventTarget.off('mousemove', self._onMouseMove)
  self._eventTarget.off('mouseup', self._end)
  // self._eventTarget.off('mousewheel', self._onScroll)
  self._eventTarget.removeClass('pan')
  self._enabled = false
}
/**
 * @return {x,y} current canvas absolute position
 */
Self.prototype.getPosition = function () {
  var self = this
  var pos = {}
  pos.x = _.toNumber(self.container.translateX())
  pos.y = _.toNumber(self.container.translateY())
  return pos
}
/**
 * Move canvas either absolute or relative
 */
Self.prototype.move = function (x, y, relative, silent) {
  var self = this
  if (relative) {
    self._moveOn(x,y)
  } else {
    self._moveTo(x,y,silent)
  }
  if (!silent) self.trigger('end')
}
/**
 * shift canvas on specified distance {deltaX, deltaY}
 */
Self.prototype._moveOn = function (deltaX, deltaY) {
  var self = this
  var current = self.getPosition()
  self._moveTo(current.x + deltaX, current.y + deltaY)
}
/**
 * Move canvas to absolute position {x,y}
 */
Self.prototype._moveTo = function (x, y, silent) {
  var self = this
  if (y !== undefined) self.container.translateY(y)
  if (x !== undefined) self.container.translateX(x)
  if (!silent) self.trigger('change')
}
/**
 * Sets self.startPoint
 * @param Number x absolute window coordinate where movement starts
 * @param Number y absolute window coordinate where movement starts
 */
Self.prototype._start = function (x, y, force) {
  var self = this
  if (!self._enabled) return
  self._inProgress = true
  self._changed = false
  var current = self.getPosition()

  self._startPoint.x = x - current.x
  self._startPoint.y = y - current.y
}

Self.prototype._run = function (x, y) {
  var self = this
  if (!self._inProgress) return
  // Ignore small shift
  var current = self.getPosition()
  if ( Math.abs(x - self._startPoint.x - current.x) < 2 &&
       Math.abs(y - self._startPoint.y - current.y) < 2) {
    return
  }

  self._changed = true
  var posX = x - self._startPoint.x
  var posY = y - self._startPoint.y
  self._moveTo(posX, posY)
}

Self.prototype._end = function () {
  var self = this
  if (self._inProgress && self._changed) {
    var posX = self.getPosition().x
    var posY = self.getPosition().y
    self.trigger('end')
  }
  self._inProgress = false
  self._changed = false
}

Self.prototype._onMouseDown = function (e) {
  var self = this
  self._start(e.pageX, e.pageY)
}

Self.prototype._onMouseMove = function (e) {
  var self = this
  self._run(e.pageX, e.pageY)
}

Self.prototype._onScroll = function (e) {
  var self = this
  var turnOff = false
  if(!self._enabled){
    self._enabled = true
    turnOff = true
  }
  self._start(0,0)
  if (e.shiftKey) {
    self._run(-e.wheelDeltaX/self.p.wheelStep, -e.wheelDeltaY/self.p.wheelStep)
  } else {
    self._run(e.wheelDeltaX/self.p.wheelStep, e.wheelDeltaY/self.p.wheelStep)
  }
  self._end()
  if( turnOff ) self._enabled = false
}

Self.prototype._onKeyDown = function (e) {
  var self = this
  e = e.originalEvent
  if ( !('keyIdentifier' in e) ) {
    e.keyIdentifier = e.key
  }
  if (!_.includes(self._controlKeys, e.keyIdentifier)) return

  var turnOff = false
  if(!self._enabled){
    self._enabled = true
    turnOff = true
  }
  self._start(0,0)

  switch(e.keyIdentifier) {
    case 'Up':
      self._run(0, - self.p.keyStep)
    break
    case 'Down':
      self._run(0, self.p.keyStep)
    break
    case 'Left':
      self._run(-self.p.keyStep, 0)
    break
    case 'Right':
      self._run(self.p.keyStep, 0)
    break
  }
  self._end()
  if( turnOff ) self._enabled = false
}

module.exports = Self
