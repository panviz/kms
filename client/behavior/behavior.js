/**
 * Behavior interface
 */
export default function Self(p) {
  var self = this
  self.p = p || {}

  self._enabled = false || p.enabled
  self._inProgress = false
}
BackboneEvents.mixin(Self.prototype)

Self.prototype.enable = function () {
  var self = this
  self._enabled = true
}

Self.prototype.disable = function () {
  var self = this
  self._enabled = false
}

Self.prototype.isEnabled = function () {
  var self = this
  return self._enabled
}

Self.prototype.status = function () {
  var self = this
  return self._inProgress
}
