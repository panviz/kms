var Self = function () {
  var self = this

  self._enabled = false
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

module.exports = Self
