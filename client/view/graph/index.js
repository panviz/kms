/**
 * Graph view based on d3.force layout
 * Here comes logic for handling visual "GUI-level" user input
 * like: click, hover, collapse/expand, right click, etc
 */
var View = require('../view')
, ForceLayout = require('../../layout/force/force')
, Utils = require('../../../core/util')

var Self = function (p) {
  var self = this
  self.p = p || {}
  self.autoLayout = false

  self.selectors = {
    body: '.view.graph svg',
    link: '.link',
    node: '.node'
  }
  var $html = $(G.Templates['view/graph/graph']())
  self.p.container.append($html)
  self.elements = Utils.findElements(self.p.container, self.selectors)

  self._edges = []
  self._nodes = []

  self.body = d3.select(self.selectors.body)
  self.resize()

  self.layout = new ForceLayout({
    width: self.p.width,
    height: self.p.height,
  })

  self.p.selection.on('add', self._onSelect.bind(self))
  $(window).on('resize', self.resize.bind(self))
}
Self.prototype = Object.create(View.prototype)

Self.prototype.render = function (vGraph) {
  var self = this
  var items = vGraph.items
  var links = vGraph.edges
   
  self._edges = self.body.selectAll(self.selectors.link)
    .data(links)

  var updateEdges = self._edges
  var edgesEnter = self._edges.enter().append('line')
  var exitEdges = self._edges.exit()

  edgesEnter
    .attr('class', self.selectors.link.slice(1))
    .style('stroke-width', function(d) { return Math.sqrt(d.value) })

  exitEdges.remove()

  self._nodes = self.body.selectAll(self.selectors.node)
    .data(items, function (d) { return d.key })

  self.layout.setup(items, links)
  if (self.autoLayout) self.layout.position()

  var enterNodes = self._nodes.enter().append('g')
  var updateNodes = self._nodes
  var exitNodes = self._nodes.exit()
  
  enterNodes.attr('class', self.selectors.node.slice(1))
    //.attr('data-key', function (d) { return d.key })
    .call(self.layout.force.drag)
    .on('click', self._onClick.bind(self))
    .on('dblclick', self._onDblClick.bind(self))

  enterNodes.append('circle')
    .attr('r', 32)

  enterNodes.append('text')
    .text(function (d) { return d.value })

  updateNodes
    .select('text')
    .text(function (d) { return d.value })

  updateNodes.attr('transform', function (d) {
    return 'translate(' + d.x + ',' + d.y + ')'
  })

  exitNodes.remove()

  updateEdges.attr('x1', function (d) { return d.source.x })
    .attr('y1', function (d) { return d.source.y })
    .attr('x2', function (d) { return d.target.x })
    .attr('y2', function (d) { return d.target.y })
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
  if (!self.autoLayout) {
    self.layout.animation.stop()
    self.layout.setAnimationHandler()
  } else {
    self.layout.setAnimationHandler(self._onAnimation.bind(self))
    self.layout.animation.start()
  }
}

Self.prototype._onSelect = function (keys) {
  var self = this
  var node = _.find(self._nodes[0], function (node) {return node.__data__.key === keys[0]})
  self._nodes.classed('selected', false)
  $(node).toggleClass('selected')
}

Self.prototype._onClick = function (node) {
  var self = this
  self.trigger('item-click', node.key)
}

Self.prototype._onDblClick = function (node) {
  var self = this
  self.p.selection.clear()
  self.p.selection.add(node.key)
  self.trigger('item-dblclick', node.key)
}

Self.prototype._onAnimation = function (node) {
  var self = this
  self._edges.attr('x1', function (d) { return d.source.x })
    .attr('y1', function (d) { return d.source.y })
    .attr('x2', function (d) { return d.target.x })
    .attr('y2', function (d) { return d.target.y })

  self._nodes.attr('transform', function (d) {
    d.x = Math.max(15, Math.min(self.p.width - 15, d.x))
    d.y = Math.max(15, Math.min(self.p.height - 15, d.y))
    return 'translate(' + d.x + ',' + d.y + ')'
  })
}

module.exports = Self
