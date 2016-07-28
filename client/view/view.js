/**
 * Base object for views
 * @event focus fires on view gain focus
 */
export default function Self (p) {
  this.p = p || {}
}
BackboneEvents.mixin(Self.prototype)

Self.prototype.show = function () {
  if (this.isVisible()) return false
  this.elements.root.show()
  this.trigger('show')
  return true
}

Self.prototype.hide = function () {
  if (!this.isVisible()) return
  this.elements.root.hide()
  this.trigger('hide')
}

Self.prototype.toggle = function () {
  this.elements.root.toggle()
}

Self.prototype.isVisible = function () {
  return this.elements.root.is(':visible')
}

Self.prototype.isFocused = function () {
  return this.elements.root.is(':focus')
}
