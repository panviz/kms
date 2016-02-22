/**
 * Grid view
 * Items are represented with tiles
 */
var RadialLayout = require('plusjs/src/layout/Radial')

var Layout = require('./layout')

var Self = function (p) {
  Layout.call(this, p)
  var self = this
  self.name = "Grid"
  self._radial = RadialLayout()
    .size([self.width, self.height])
    .position(function (d) { return d.index })
    .radius((Math.min(self.width, self.height))/2 * 0.8)
}
Self.prototype = Object.create(Layout.prototype)

Self.prototype.run = function (items) {
  var self = this
  _.each(items, function (item, key) {
    if (!item.index) item.index = key
  })
  self._radial(items)
}

module.exports = Self
