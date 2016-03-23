/**
 * Base object for layouts
 */
export default function Self(p) {
  var self = this
  self.p = p || {}
  self.width = p.width || 0
  self.height = p.height || 0
}
BackboneEvents.mixin(Self.prototype)

Self.prototype.size = function (width, height) {
  var self = this
  self.width = width
  self.height = height
}

Self.prototype.run = function () {
}
