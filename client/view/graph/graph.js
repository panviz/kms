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
/**
 * @param Object p.node Default spatial parameters for rendering node
 * @inner Graph _graph rendered last time
 * @inner Array _items array of keys of items actually
 * @inner Array _nodes d3 selection of DOM nodes
 * @inner Array _edges d3 selection of DOM edges
 */
var Self = function (p) {
  var self = this
  self.p = p || {}

  self.autoLayout = true
  self.actionman = p.actionman
  self.selection = p.selection

  self.selectors = {
    svg: 'svg',
    canvas: 'svg .canvas',
    edgeGroup: '.edgeGroup',
    nodeGroup: '.nodeGroup',
    link: '.link',
    node: '.node',
    hidden: '.hide',
    selected: '.selected',
  }
  var $html = $(G.Templates['view/graph/graph']())
  self.p.container.append($html)
  self.elements = Util.findElements($html, self.selectors)

  self.p.node = {
    selector: self.selectors.node,
    size: {
      width: 32,
      height: 32
    },
    gap: 8,
    label: {
      maxLength: 15,
    }
  }
  self._graph
  self._items = []
  self._edges = []
  self._nodes = []

  self.canvas = d3.select(self.selectors.canvas)
  self.resize()
  self._initLayouts()
  self._initViewActions()

  self.selection.on('add', self._onSelect.bind(self))
  self.selection.on('remove', self._onDeselect.bind(self))
  self.elements.svg.on('dblclick', self.selectors.node, self._onNodeDblClick.bind(self))
  $(window).on('resize', self.resize.bind(self))
}
Self.prototype = Object.create(View.prototype)
/**
 * initialize all available layouts in view
 */
Self.prototype._initLayouts = function () {
  var self = this
  var forceLayout = new ForceLayout({
    width: self.p.width,
    height: self.p.height,
    node: self.p.node,
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
  // TODO change Grid and Radial layouts firing
  //self.actions = [
    //require('./action/forceLayout'),
    //require('./action/gridLayout'),
    //require('./action/radialLayout')
  //]
  //_.each(self.actions, function (action) {
    //self.actionman.set(action, self)
  //})
  self.layout = self.layouts.force
  self.layout.on('tick', self._updatePosition, self)
}
/**
 * initialize View actions and their functions
 */
Self.prototype._initViewActions = function () {
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
/**
 * render new graph in the view using current layout
 */
Self.prototype.render = function (graph) {
  var self = this
  self._graph = graph
  self._items = graph.getItemKeys()
   
  // bind DOM nodes to items
  self._nodes = self.canvas.select(self.selectors.nodeGroup)
    .selectAll(self.selectors.node)
    .data(self._items, function (d) { return d})

  self._enterNodes()
  self._updateNodes()
  self._exitNodes()

  self.layout.update(graph, self._enteredNodes[0])
  // init edges only after its coord are ready
  self._edges = self.canvas.select(self.selectors.edgeGroup)
    .selectAll(self.selectors.link)
    .data(self._graph.getLinksArray())
  self._enterEdges()
  self._exitEdges()

  self._updatePosition()
  self.layout.once('tick', function () {
    self._enteredNodes.classed(self.selectors.hidden.slice(1), false)
    self._enteredEdges.classed(self.selectors.hidden.slice(1), false)
    self._exitedNodes.classed(self.selectors.hidden.slice(1), true)
    self._exitedEdges.classed(self.selectors.hidden.slice(1), true)
  })
  self.updateLayout({duration: 1000})
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
}
/**
 * run current view layout for
 */
Self.prototype.updateLayout = function (p) {
  var self = this
  if (self.autoLayout) self.layout.run(p, self._graph)
}
/**
 * TODO make action for it
 */
Self.prototype.toggleAutoLayout = function () {
  var self = this
  self.autoLayout = !self.autoLayout
}
/**
 * append new Edges to DOM
 */
Self.prototype._enterEdges = function () {
  var self = this

  self._enteredEdges = self._edges.enter().append('line')
  self._enteredEdges
    .classed(self.selectors.link.slice(1) + ' ' + self.selectors.hidden.slice(1), true)
}
/**
 * remove dropped off Edges from DOM
 */
Self.prototype._exitEdges = function () {
  var self = this
  self._exitedEdges = self._edges.exit()
  self._exitedEdges
    .classed(self.selectors.hidden.slice(1), true)
  setTimeout(function () {
    self._exitedEdges.remove()
  }, 750)
}
/**
 * append new nodes to DOM
 */
Self.prototype._enterNodes = function () {
  var self = this
  self._enteredNodes = self._nodes.enter().append('g')
  self._enteredNodes
    .classed(self.selectors.node.slice(1) + ' ' + self.selectors.hidden.slice(1), true)
    .classed(self.selectors.selected.slice(1), function (key) { return _.includes(self.selection.getAll(), key)})
  self._enteredNodes
    .append('circle')
    .attr('r', self.p.node.size.width/2)
  self._enteredNodes
    .append('text')
    .attr('x', self.p.node.size.width * 0.56)
    .attr('y', self.p.node.size.width * -0.19)
    .text(self._getLabel.bind(self))
}
/**
 * update DOM nodes
 */
Self.prototype._updateNodes = function () {
  var self = this
  self._nodes
    .select('text')
    .text(self._getLabel.bind(self))
}
/**
 * remove DOM nodes
 */
Self.prototype._exitNodes = function () {
  var self = this
  self._exitedNodes = self._nodes.exit()
  self._exitedNodes
    .classed(self.selectors.hidden.slice(1), true)
  setTimeout(function () {
    self._exitedNodes.remove()
  }, 750)
}
/**
 * update nodes and edges positions in DOM
 */
Self.prototype._updatePosition = function () {
  var self = this
  var items = self._items
  var coords = self.layout.getCoords()
  _.each(self._nodes[0], function (node) {
    var $node = $(node)
    var item = node.__data__
    var coord = coords[items.indexOf(item)]
    $node.translateX(coord.x)
    $node.translateY(coord.y)
    //if (item == 'job') console.log(coord.x + ', ' + coord.y);
  })
  _.each(self._edges[0], function (edge) {
    var source = edge.__data__[0]
    var target = edge.__data__[1]
    var sCoord = coords[items.indexOf(source)]
    var tCoord = coords[items.indexOf(target)]
    edge.setAttribute('x1', sCoord.x)
    edge.setAttribute('y1', sCoord.y)
    edge.setAttribute('x2', tCoord.x)
    edge.setAttribute('y2', tCoord.y)
  })
}

Self.prototype._getLabel = function (d) {
  var self = this
  var value = self._graph.get(d)
  value = value.substr(0, value.indexOf('\n')) || value
  if (value.length > self.p.node.label.maxLength) value = value.slice(0, 15) + '...'
  return value
}

Self.prototype._onDrop = function (targetNode) {
  var self = this
  if (!targetNode) return
  self.actionman.get('itemLink').apply(targetNode[0].__data__)
}

Self.prototype._onNodeMove = function (delta) {
  var self = this
  var panDelta = self.pan.getPosition()
  var keys = self.selection.getAll()
  _.each(keys, function (key) {
    var node = _.find(self._nodes[0], function (node) {return node.__data__ === key})
    var item = node.__data__
    d3.select(node).append('image')
      .attr('x', 0)
      .attr('y', -self.p.node.size.width*0.68)
      .attr('width', self.p.node.size.width/2)
      .attr('height', self.p.node.size.width/2)
      .attr('xlink:href', '/client/view/graph/pin.svg')

    // Fix item to dropped position
    self.layout.move(item, delta)
    self.layout.fix(item)
  })
  self.updateLayout({duration: 200})
}

Self.prototype._onSelect = function (keys) {
  var self = this
  _.each(keys, function (key) {
    var node = _.find(self._nodes[0], function (node) {return node.__data__ === key})
    if (node) node.classList.add(self.selectors.selected.slice(1))
  })
}

Self.prototype._onDeselect = function (keys) {
  var self = this
  _.each(keys, function (key) {
    var node = _.find(self._nodes[0], function (node) {return node.__data__ === key})
    if (node) node.classList.remove(self.selectors.selected.slice(1))
  })
}

Self.prototype._onNodeDblClick = function (e) {
  var self = this
  var key = e.currentTarget.__data__
  self.actionman.get('itemShowChildren').apply()
}

module.exports = Self
