/**
 * Base object for views
 * @event focus fires on view gain focus
 */
var Self = function (p) {
  var self = this
  self.p = p || {}
}
BackboneEvents.mixin(Self.prototype)

Self.prototype.show = function () {
  var self = this
  if (self.isVisible()) return
  self.elements.root.show()
  self.trigger('show')
  return true
}

Self.prototype.hide = function () {
  var self = this
  if (!self.isVisible()) return
  self.elements.root.hide()
  self.trigger('hide')
}

Self.prototype.toggle = function () {
  var self = this
  self.elements.root.toggle()
}

Self.prototype.isVisible = function () {
  var self = this
  return self.elements.root.is(':visible')
}

Self.prototype.isFocused = function () {
  var self = this
  return self.elements.root.is(':focus')
}

module.exports = Self
