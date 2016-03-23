/**
 * Grid view
 * Items are represented with tiles
 */
import RadialLayout from 'plusjs/src/layout/Radial'
import Layout from './layout'

export default function Self(p) {
  Layout.call(this, p)
  var self = this
  self.name = 'Radial'
  self._radial = RadialLayout()
    .size([self.width, self.height])
    .position(function (d) { return d.index })
    .radius((Math.min(self.width, self.height)) / 2 * 0.8)
}
Self.prototype = Object.create(Layout.prototype)

Self.prototype.run = function (items) {
  var self = this
  _.each(items, function (item, key) {
    if (!item.index) item.index = key
  })
  self._radial(items)
}
