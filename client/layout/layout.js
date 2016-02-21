/**
 * Base object for layouts
 */
var Self = function (p) {
  var self = this
  self.p = p || {}
  self.width = p.width || 0
  self.height = p.height || 0
}

Self.prototype.size = function (width, height) {
  var self = this
  self.width = width
  self.height = height
}

Self.prototype.run = function () {
}

module.exports = Self
