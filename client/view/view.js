/**
 * Base object for views
 * @event focus fires on view gain focus
 */
var Self = function (p) {
  var self = this
  self.p = p || {}
}
BackboneEvents.mixin(Self.prototype)

Self.prototype.show = function (vGraph) {
  var self = this
  self.elements.root.show()
}

Self.prototype.hide = function (vGraph) {
  var self = this
  self.elements.root.hide()
}

Self.prototype.toggle = function (vGraph) {
  var self = this
  self.elements.root.toggle()
}

Self.prototype.isFocused = function () {
}

module.exports = Self
