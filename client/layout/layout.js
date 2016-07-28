/**
 * Base object for layouts
 */
export default function Self (p) {
  this.p = p || {}
  this.width = p.width || 0
  this.height = p.height || 0
}
BackboneEvents.mixin(Self.prototype)

Self.prototype.size = function (width, height) {
  this.width = width
  this.height = height
}

Self.prototype.run = function () {
}
