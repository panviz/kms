/**
 * Graph view based on d3.force layout
 * Here comes logic for handling visual "GUI-level" user input
 * like: click, hover, collapse/expand, right click, etc
 */
var View = require('../view')
, Utils = require('../../../core/util')

var Self = function (p) {
  var self = this
  self.p = p || {}
  self.autoLayout = true

  self.selectors = {
    body: '.view.graph svg',
    link: '.link',
    node: '.node'
  }
  var $html = $(G.Templates['view/graph/graph']())
  self.p.container.append($html)
  self.elements = Utils.findElements(self.p.container, self.selectors)

  self._links = []
  self._nodes = []

  self.force = d3.layout.force()
    //for big graphs
    .charge(-400)
    .linkDistance(150)
    //.charge(-220)
    //.linkDistance(40)
    .gravity(0)
    .size([self.p.width, self.p.height])

  self.body = d3.select(self.selectors.body)
  self.resize()

  self.p.selection.on('add', self._onSelect.bind(self))
  $(window).on('resize', self.resize.bind(self))
}
Self.prototype = Object.create(View.prototype)

Self.prototype.render = function (vGraph) {
  var self = this
  var items = vGraph.items
  var edges = vGraph.edges
  for (var i = 0; i < items.length; i++) {
    items[i].x = items[i].x || Math.random() * self.p.width/10 + self.p.width/2 - self.p.width/20
    items[i].y = items[i].y || Math.random() * self.p.height/10 + self.p.height/2 - self.p.height/20
  }
   
  self.force
    .nodes(items)
    .links(edges)
  if (self.autoLayout) self.force.start()

  self._links = self.body.selectAll(self.selectors.link)
    .data(edges)

  var lines = self._links.enter().append('line')
    .attr('class', self.selectors.link.slice(1))
    .style('stroke-width', function(d) { return Math.sqrt(d.value) })
  self._links.exit().remove()

  self._nodes = self.body.selectAll(self.selectors.node)
    .data(items, function (d) { return d.key })

  var enter = self._nodes.enter().append('g')
  var update = self._nodes
  var exit = self._nodes.exit()
  
  enter.attr('class', self.selectors.node.slice(1))
    //.attr('data-key', function (d) { return d.key })
    .call(self.force.drag)
    .on('click', self._onClick.bind(self))
    .on('dblclick', self._onDblClick.bind(self))

  enter.append('circle')
    .attr('r', 32)

  enter.append('text')
    .text(function (d) { return d.value })

  update
    .select('text')
    .text(function (d) { return d.value })

  exit.remove()

  self.force.on('tick', self._onTick.bind(self))
}
/**
 * take all available space
 */
Self.prototype.resize = function () {
  var self = this
  self.p.height = self.elements.root.height()
  self.p.width = self.elements.root.width()
  self.body
    .attr('width', self.p.width)
    .attr('height', self.p.height)
}
Self.prototype.toggleAutoLayout = function () {
  var self = this
  self.autoLayout = !self.autoLayout
  if (!self.autoLayout) self.force.stop()
  else self.force.start()
}

Self.prototype._onTick = function () {
  var self = this
  self._links.attr('x1', function (d) { return d.source.x })
    .attr('y1', function (d) { return d.source.y })
    .attr('x2', function (d) { return d.target.x })
    .attr('y2', function (d) { return d.target.y })

  self._nodes.attr('transform', function (d) {
    d.x = Math.max(15, Math.min(self.p.width - 15, d.x))
    d.y = Math.max(15, Math.min(self.p.height - 15, d.y))
    return 'translate(' + d.x + ',' + d.y + ')'
  })
}

Self.prototype._onSelect = function (selection) {
  var self = this
}

Self.prototype._onClick = function (node) {
  var self = this
  node.key
}

Self.prototype._onDblClick = function (node) {
  var self = this
  self.p.selection.clear()
  self.p.selection.add(node.key)
}

module.exports = Self
