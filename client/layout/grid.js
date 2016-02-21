/**
 * Grid view
 * Items are represented with tiles
 */
var Layout = require('./layout')

var Self = function (p) {
  Layout.call(this, p)
  var self = this
  self.name = "Grid"
}
Self.prototype = Object.create(Layout.prototype)

Self.prototype.run = function (items) {
  var self = this
  var offset = self.p.offset || {x:0, y:0}
  if (!self.p.spacing) self.p.spacing = 0
  var spacing = _.isPlainObject(self.p.spacing) ? self.p.spacing : {x: self.p.spacing, y: self.p.spacing}
  offset.x = self.p.x || self.p.offset.x
  offset.y = self.p.y || self.p.offset.y
  self.p.item = self.p.item || {}
  var itemWidth = self.p.item.width
  var itemHeight = self.p.item.height
  var columns = self.p.columns || Math.floor((self.width - offset.x) / (itemWidth + spacing.x))
  var rows = self.p.rows

  var n = items.length;
  var line = 0
  var column = 0
  _.each(items, function (item) {
    item.x = item.px = offset.x + (itemWidth + spacing.x) * column
    column += 1
    item.y = item.py = offset.y + (itemHeight + spacing.y) * line
    if (column >= columns || item.x + itemWidth + spacing.x > offset.x + self.width){
      line +=1; column = 0
    }
  })
}

module.exports = Self
