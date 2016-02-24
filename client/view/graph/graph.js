/**
 * Graph view
 * Utilizes several layouts
 * Here comes logic for handling visual "GUI-level" user input
 * like: click, hover, collapse/expand, right click, etc
 */
var View = require('../view')
, ForceLayout = require('../../layout/force')
, GridLayout = require('../../layout/grid')
, RadialLayout = require('../../layout/radial')
, Selectioning = require('../../behavior/selection/selectioning')
, RectSelectioning = require('../../behavior/selection/rectangular')
, Pan = require('../../behavior/pan/pan')
, Drag = require('../../behavior/drag/drag')
, Util = require('../../../core/util')

var Self = function (p) {
  var self = this
  self.p = p || {}

  self.autoLayout = true
  self.actionman = p.actionman
  self.selection = p.selection

  self.selectors = {
    svg: 'svg',
    canvas: 'svg .canvas',
    link: '.link',
    node: '.node',
  }
  self.actions = [
    require('./action/forceLayout'),
    require('./action/gridLayout'),
    require('./action/radialLayout')
  ]
  _.each(self.actions, function (action) {
    self.actionman.set(action, self)
  })
  var $html = $(G.Templates['view/graph/graph']())
  self.p.container.append($html)
  self.elements = Util.findElements($html, self.selectors)

  self.p.node = {
    selector: self.selectors.node,
    size: {
      width: 32,
      height: 32
    },
    label: {
      maxLength: 15,
    }
  }
  self._edges = []
  self._nodes = []

  self.canvas = d3.select(self.selectors.canvas)
  self.resize()
  self._initLayouts()
  self._initBehaviors()

  self.selection.on('add', self._onSelect.bind(self))
  self.selection.on('remove', self._onDeselect.bind(self))
  self.elements.svg.on('dblclick', self.selectors.node, self._onNodeDblClick.bind(self))
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

  if (self.autoLayout) self.layout.run(self._items, self._links)

  var updateEdges = self._edges
  var enterEdges = self._edges.enter().append('line')
  var exitEdges = self._edges.exit()

  var enterNodes = self._nodes.enter().append('g')
  var updateNodes = self._nodes
  var exitNodes = self._nodes.exit()
  
  enterEdges
    .attr('class', self.selectors.link.slice(1))
    .style('stroke-width', function(d) { return Math.sqrt(d.value) })
  enterEdges
    .attr('x1', function (d) { return d.source.x })
    .attr('y1', function (d) { return d.source.y })
    .attr('x2', function (d) { return d.target.x })
    .attr('y2', function (d) { return d.target.y })

  enterNodes
    .attr('class', self.selectors.node.slice(1))
    .attr('style', function (d) {
      return 'transform: translate(' + d.x + 'px,' + d.y + 'px)'
    })
  enterNodes
    .append('circle')
    .attr('r', self.p.node.size.width/2)
  enterNodes
    .append('text')
    .attr('x', 10)
    .attr('dy', '.35em')
    .attr('dx', '.70em')
    .text(self._getLabel.bind(self))

  self.update()

  exitEdges.remove()
  exitNodes.remove()
  // TODO do not trigger on first load (as everything is already made on enterNodes)
  self.updatePosition()
}

Self.prototype.update = function () {
  var self = this
  self._nodes
    .select('text')
    .text(self._getLabel.bind(self))
}

Self.prototype.updatePosition = function () {
  var self = this
  if (self.autoLayout) self.layout.run(self._items, self._links)
  self._edges
    .transition()
    .attr('x1', function (d) { return d.source.x })
    .attr('y1', function (d) { return d.source.y })
    .attr('x2', function (d) { return d.target.x })
    .attr('y2', function (d) { return d.target.y })

  self._nodes
    .transition()
    .attr('style', function (d) {
      return 'transform: translate(' + d.x + 'px,' + d.y + 'px)'
    })
}
/**
 * take all available space
 */
Self.prototype.resize = function () {
  var self = this
  self.elements.svg.detach()
  self.p.height = self.elements.root.height()
  self.p.width = self.elements.root.width()
  self.elements.root.append(self.elements.svg)
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

Self.prototype._initLayouts = function () {
  var self = this
  var forceLayout = new ForceLayout({
    width: self.p.width,
    height: self.p.height,
  })
  var gridLayout = new GridLayout({
    width: self.p.width,
    height: self.p.height,
    node: self.p.node.size,
    offset: {x: self.p.node.size.width, y: self.p.node.size.height},
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
  //self.layout.force.on('tick', self.updatePosition.bind(self))
}

Self.prototype._initBehaviors = function () {
  var self = this
  self.elements.svg.addClass('behavior')
  self.drag = new Drag({
    container: self.elements.svg,
    node: self.p.node,
  })
  self.drag.enable()
  self.drag.on('drop', self._onDrop.bind(self))
  self.drag.on('move', self._onNodeMove.bind(self))

  self.pan = new Pan({
    container: self.elements.svg,
    panElement: self.elements.canvas,
  })
  self.pan.enable()

  self.selectioning = new Selectioning({
    selection: self.selection,
    container: self.elements.svg,
    nodeSelector: self.selectors.node,
  })
  self.rectSelectioning = new RectSelectioning({
    selection: self.selection,
    nodes: self._nodes,
    container: self.elements.root,
    eventTarget: self.elements.svg,
  })
}

Self.prototype._onDrop = function (targetNode) {
  var self = this
  if (!targetNode) return
  self.actionman.get('itemLink').apply(targetNode[0].__data__.key)
}

Self.prototype._onNodeMove = function (delta) {
  var self = this
  // Fix item to dropped position
  var keys = self.selection.getAll()
  _.each(keys, function (key) {
    var item = _.find(self._items, {key: key})
    item.fixed = true
    item.x = item.px = item.x + delta.x
    item.y = item.py = item.y + delta.y
  })
  self.updatePosition()
}

Self.prototype._getLabel = function (d) {
  var self = this
  var value = d.value
  if (value.length > self.p.node.label.maxLength) value = value.slice(0, 15) + '...'
  return value
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

Self.prototype._onNodeDblClick = function (e) {
  var self = this
  var key = e.currentTarget.__data__.key
  self.actionman.get('itemShowChildren').apply()
}

module.exports = Self
