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
  self.elements.root.show()
}

Self.prototype.hide = function () {
  var self = this
  self.elements.root.hide()
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
