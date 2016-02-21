/**
 * Graph view based on d3.force layout
 * Here comes logic for handling visual "GUI-level" user input
 * like: click, hover, collapse/expand, right click, etc
 */
var View = require('../view')
, ForceLayout = require('../../layout/force')
, GridLayout = require('../../layout/grid')
, RadialLayout = require('../../layout/radial')
, Pan = require('../../behavior/pan')
, Util = require('../../../core/util')

var Self = function (p) {
  var self = this
  self.p = p || {}
  self.p.itemSize = {width: 32, height: 32}
  self.autoLayout = true
  self.actionman = p.actionman
  self.selection = p.selection

  self.selectors = {
    viewContainer: '.view.graph',
    svg: 'svg',
    canvas: 'svg .canvas',
    link: '.link',
    node: '.node',
  }
  self.actions = [require('./action/forceLayout'), require('./action/gridLayout'), require('./action/radialLayout')]
  _.each(self.actions, function (action) {
    action.view = self
    self.actionman.set(action)
  })
  var $html = $(G.Templates['view/graph/graph']())
  self.p.container.append($html)
  self.elements = Util.findElements(self.p.container, self.selectors)

  self._edges = []
  self._nodes = []

  self.canvas = d3.select(self.selectors.canvas)
  self.resize()
  self.initLayouts()

  self.panning = new Pan({
    container: self.elements.canvas,
    eventTarget: self.elements.svg,
  })
  self.panning.enable()

  self.selection.on('add', self._onSelect.bind(self))
  self.selection.on('remove', self._onDeselect.bind(self))
  self.elements.svg.on('click', self._onBgClick.bind(self))
  $(window).on('resize', self.resize.bind(self))
}
Self.prototype = Object.create(View.prototype)

Self.prototype.render = function (vGraph) {
  var self = this
  self._items = vGraph.items
  self._links = vGraph.edges
   
  self._edges = self.canvas.selectAll(self.selectors.link)
    .data(self._links)
  self._nodes = self.canvas.selectAll(self.selectors.node)
    .data(self._items, function (d) { return d.key })

  if (self.layout.setup) self.layout.setup(self._items, self._links)
  if (self.autoLayout) self.layout.run(self._items)

  var updateEdges = self._edges
  var enterEdges = self._edges.enter().append('line')
  var exitEdges = self._edges.exit()

  enterEdges
    .attr('class', self.selectors.link.slice(1))
    .style('stroke-width', function(d) { return Math.sqrt(d.value) })

  exitEdges.remove()

  var enterNodes = self._nodes.enter().append('g')
  var updateNodes = self._nodes
  var exitNodes = self._nodes.exit()
  
  enterNodes.attr('class', self.selectors.node.slice(1))
    //.attr('data-key', function (d) { return d.key })
    .on('click', self._onClick.bind(self))
    .on('dblclick', self._onDblClick.bind(self))
    .attr('transform', function (d) {
      return 'translate(' + d.x + ',' + d.y + ')'
    })
  enterEdges
    .attr('x1', function (d) { return d.source.x })
    .attr('y1', function (d) { return d.source.y })
    .attr('x2', function (d) { return d.target.x })
    .attr('y2', function (d) { return d.target.y })

  enterNodes.append('circle')
    .attr('r', self.p.itemSize.width)

  enterNodes.append('text')
    .text(self._getLabel)

  updateNodes
    .select('text')
    .text(self._getLabel)

  exitNodes.remove()
  // TODO do not trigger on first load (as everything is already made on enterNodes)
  self.updatePosition()
}

Self.prototype.updatePosition = function () {
  var self = this
  if (self.autoLayout) self.layout.run(self._items)
  self._edges
    .transition()
    .attr('x1', function (d) { return d.source.x })
    .attr('y1', function (d) { return d.source.y })
    .attr('x2', function (d) { return d.target.x })
    .attr('y2', function (d) { return d.target.y })

  self._nodes
    .transition()
    .attr('transform', function (d) {
      return 'translate(' + d.x + ',' + d.y + ')'
    })
}
/**
 * take all available space
 */
Self.prototype.resize = function () {
  var self = this
  self.elements.svg.detach()
  self.p.height = self.elements.viewContainer.height()
  self.p.width = self.elements.viewContainer.width()
  self.elements.viewContainer.append(self.elements.svg)
  self.elements.svg
    .width(self.p.width)
    .height(self.p.height)
  if (self.layout) {
    self.layout.size(self.p.width, self.p.height)
    self.updatePosition()
  }
}

Self.prototype.toggleAutoLayout = function () {
  var self = this
  self.autoLayout = !self.autoLayout
  if (!self.autoLayout) {
    self.layout.animation.stop()
    self.layout.setAnimationHandler()
  } else {
    self.layout.setAnimationHandler(self.updatePosition.bind(self))
    self.layout.animation.start()
  }
}

Self.prototype.isFocused = function () {
  return true
}

Self.prototype.initLayouts = function () {
  var self = this
  var forceLayout = new ForceLayout({
    width: self.p.width,
    height: self.p.height,
  })
  var gridLayout = new GridLayout({
    width: self.p.width,
    height: self.p.height,
    item: self.p.itemSize,
    offset: {x: self.p.itemSize.width, y: self.p.itemSize.height},
    spacing: 100,
  })
  var radialLayout = new RadialLayout({
    width: self.p.width,
    height: self.p.height,
  })
  self.layouts = {
    force: forceLayout,
    grid: gridLayout,
    radial: radialLayout,
  }
  self.layout = self.layouts.force
}

Self.prototype._getLabel = function (d) {
  return d.value.slice(0, 15)
}

Self.prototype._onSelect = function (keys) {
  var self = this
  _.each(keys, function (key) {
    var node = _.find(self._nodes[0], function (node) {return node.__data__.key === key})
    $(node).addClass('selected')
  })
}

Self.prototype._onDeselect = function (keys) {
  var self = this
  _.each(keys, function (key) {
    var node = _.find(self._nodes[0], function (node) {return node.__data__.key === key})
    $(node).removeClass('selected')
  })
}

Self.prototype._onClick = function (node) {
  var self = this
  d3.event.stopPropagation()
  self.selection.clear()
  self.selection.add(node.key)
  self.trigger('item-click', node.key)
}

Self.prototype._onDblClick = function (node) {
  var self = this
  d3.event.stopPropagation()
  self.trigger('item-dblclick', node.key)
}

Self.prototype._onBgClick = function () {
  var self = this
  self.selection.clear()
  self._nodes.classed('selected', false)
  self.trigger('background-click')
}

module.exports = Self
