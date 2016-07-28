/**
 * Behavior interface
 */
export default function Self (p = {}) {
  this.p = p

  this._enabled = false || p.enabled
  this._inProgress = false
}
BackboneEvents.mixin(Self.prototype)

Self.prototype.enable = function () {
  this._enabled = true
}

Self.prototype.disable = function () {
  this._enabled = false
}

Self.prototype.isEnabled = function () {
  return this._enabled
}

Self.prototype.status = function () {
  return this._inProgress
}
