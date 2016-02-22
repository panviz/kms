/**
 * Grid view
 * Items are represented with tiles
 */
var Layout = require('./layout')
/**
 * @param {Object || Number} p.spacing horizontal and vertical distance between items
 * @param Point p.offset {x,y} coordinates where to place first node
 * @param Object p.node {width, height} of node (add to spacing when calculating next node position)
 */
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
  self.p.node = self.p.node || {}
  var itemWidth = self.p.node.width
  var itemHeight = self.p.node.height || self.p.node.width
  var columns = self.p.columns || Math.floor((self.width - offset.x) / (itemWidth + spacing.x))
  var rows = self.p.rows

  var n = items.length;
  var line = 0
  var column = 0
  _.each(items, function (node) {
    node.x = node.px = offset.x + (itemWidth + spacing.x) * column
    column += 1
    node.y = node.py = offset.y + (itemHeight + spacing.y) * line
    if (column >= columns || node.x + itemWidth + spacing.x > offset.x + self.width){
      line +=1; column = 0
    }
  })
}

module.exports = Self
