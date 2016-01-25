/**
 * List view
 * Items are represented with rows
 */
var Self = function (p) {
  var self = this
  self.p = p || {}

  self._links = []
  self._nodes = []
}

Self.prototype.draw = function (graph) {
}

module.exports = Self
