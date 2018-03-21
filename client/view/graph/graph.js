/**
 * Graph view
 * Utilizes several layouts
 * Here comes logic for handling visual "GUI-level" user input
 * like: click, hover, collapse/expand, right click, etc
 */
import { Force } from '@graphiy/layout'
// import { Grid } from '@graphiy/layout'
// import { Radial } from '@graphiy/layout'
import { Selectioning, Pan, Drag } from '@graphiy/behavior'
import Util from '../../../core/util'

import View from '../view'
import template from './graph.html'
import './graph.scss'
/**
 * @param Object p.node Default spatial parameters for rendering node
 * @inner Graph _graph rendered last time
 * @inner Array _items array of keys of items actually
 * @inner Array _nodes d3 selection of DOM nodes
 * @inner Array _edges d3 selection of DOM edges
 */
export default class Graph extends View {
  constructor (p, name) {
    super(p)
    this.graph = {}
    this.name = name

    this.autoLayout = true
    this.actionman = p.actionman
    this.itemman = p.itemman
    this.itemman.on('repo:load', this._reload.bind(this))
    this.itemman.on('item:create', this._addToSelection.bind(this))
    this.itemman.on('item:associate', this._reload.bind(this))
    this.itemman.on('item:disassociate', this._reload.bind(this))
    this.itemman.on('item:remove', this._reload.bind(this))
    this.itemman.on('item:showChildren', this._reload.bind(this))
    this.itemman.on('item:deleteCoords', this._reload.bind(this))

    const $html = $(template({ name }))
    this.setElement($html)

    this.p.node = {
      selector: this.selectors.node,
      size: {
        width: 32,
        height: 32,
      },
      gap: 8,
      label: {
        maxLength: 15,
      },
    }

    this.canvas = d3.select(`.${this.name} ${this.selectors.canvas}`)
    this.svg = d3.select(`.${this.name} ${this.selectors.svg}`)

    this._initLayouts()
    this.resize()
    this._initViewActions()

    this.selection.on('add', this._onSelect.bind(this))
    this.selection.on('remove', this._onDeselect.bind(this))

    this.elements.container.on('click', this._onClick.bind(this))
    // $(window).on('resize', this.resize.bind(this))
  }

  get selectors () {
    return _.extend(super.selectors, {
      svg: 'svg',
      container: '.container',
      canvas: '.container .canvas',
      edgeGroup: '.edgeGroup',
      nodeGroup: '.nodeGroup',
      link: '.link',
      node: '.node',
      tag: '.tag',
      note: '.note',
      hidden: '.hide',
      selected: '.selected',
    })
  }

  get events () {
    return _.extend(super.events, {
      'dblclick .container': this._onNodeDblClick,
    })
  }
  /**
   * initialize all available layouts in view
   */
  _initLayouts () {
    const force = new Force({ distance: 100 })

    this.layout = force
    this.layout.on('end', this._updatePosition, this)
  }
  /**
   * initialize View actions and their functions
   */
  _initViewActions () {
    this.elements.container.addClass('behavior')
    this.drag = new Drag({
      container: this.elements.container,
      node: this.p.node,
      moveThreshold: 16,
    })
    this.drag.enable()
    this.drag.on('drop', this._onDrop.bind(this))
    this.drag.on('move', this._onNodeMove.bind(this))

    this.pan = new Pan({
      container: this.elements.container,
      element: this.elements.canvas,
    })
    this.pan.enable()

    this.selectioning = new Selectioning({
      selection: this.selection,
      container: this.elements.canvas,
      node: { selector: this.selectors.node },
    })
    this.selectioning.enable()
  }
  /**
   * render new graph in the view using current layout
   */
  render (graph, items) {
    this._graph = graph
    this._items = graph.getItemKeys()

    // bind DOM nodes to items
    this._nodes = this.canvas.select(this.selectors.nodeGroup)
      .selectAll(this.selectors.node)
      .data(this._items, d => d)

    this._enterNodes()
    this._updateNodes(items)
    this._exitNodes()

    const nodes = this._graph.getItemKeys()
    const linksArr = this._graph.getLinksArray()
    const links = []
    _.each(linksArr, (link) => {
      const source = nodes.indexOf(link[0])
      const target = nodes.indexOf(link[1])
      links.push({ source, target })
    })
    const data = []
    _.each(nodes, (node) => {
      let coords = {}
      if (this.coords && this.coords[node]) {
        try {
          coords = JSON.parse(this.coords[node])
          data.push({
            id: node,
            x: 0,
            y: 0,
            fx: coords.x,
            fy: coords.y,
          })
        } catch (e) {
          console.log('Wrong coords format') // eslint-disable-line
        }
      } else {
        data.push({ id: node, x: 0, y: 0 })
      }
    })

    this.layout.update(data, links)

    // init edges only after its coord are ready
    this._edges = this.svg.select(this.selectors.edgeGroup)
      .selectAll(this.selectors.link)
      .data(this._graph.getLinksArray())

    this._enterEdges()
    this._exitEdges()

    this._updatePosition()
    this.layout.once('end', () => {
      this._enteredNodes.classed(this.selectors.hidden.slice(1), false)
      this._enteredEdges.classed(this.selectors.hidden.slice(1), false)
      this._exitedNodes.classed(this.selectors.hidden.slice(1), true)
      this._exitedEdges.classed(this.selectors.hidden.slice(1), true)
    })
    this.updateLayout()
  }
  /**
   * take all available space
   */
  resize () {
    this.elements.svg.detach()
    this.p.height = this.elements.root.height()
    this.p.width = this.elements.root.width()
    this.elements.canvas.prepend(this.elements.svg)
    this.elements.svg
      .width(this.p.width)
      .height(this.p.height)

    this.updateLayoutConfig()
  }
  /**
   * run current view layout for
   */
  updateLayout () {
    if (this.autoLayout) this.layout.run()
  }

  updateLayoutConfig () {
    const options = {
      width: this.elements.root.width(),
      height: this.elements.root.height(),
    }
    _.assign(this.layout.p, options)
  }
  /**
   * TODO make action for it
   */
  toggleAutoLayout () {
    this.autoLayout = !this.autoLayout
  }

  getFixedNodeCoords () {
    const coords = {}
    const fixedKeys = this.fixedNodes.getAll()
    const nodeSelection = this.canvas.selectAll(this.selectors.node)
      .filter(d => fixedKeys.indexOf(d) !== -1)
    const nodes = nodeSelection.nodes()
    _.each(nodes, (node) => {
      const transform = node.style.transform
      const coord = Util.getPosition(transform)
      coords[node.__data__] = coord
    })
    return coords
  }
  /**
   * append new Edges to DOM
   */
  _enterEdges () {
    this._enteredEdges = this._edges.enter().append('line')
    this._enteredEdges
      .classed(`${this.selectors.link.slice(1)} ${this.selectors.hidden.slice(1)}`, true)
  }
  /**
   * remove dropped off Edges from DOM
   */
  _exitEdges () {
    this._exitedEdges = this._edges.exit()
    this._exitedEdges
      .classed(this.selectors.hidden.slice(1), true)
    setTimeout(() => {
      this._exitedEdges.remove()
    }, 750)
  }
  /**
   * append new nodes to DOM
   */
  _enterNodes () {
    this._enteredNodes = this._nodes.enter().append('div')
    this._enteredNodes
      .classed(`${this.selectors.node.slice(1)} ${this.selectors.hidden.slice(1)}`, true)
      .classed(this.selectors.selected.slice(1), key => _.includes(this.selection.getAll(), key))
    this._enteredNodes
      .append('div')
      .attr('class', 'circle')
      .style('width', this.p.node.size.width)
      .style('height', this.p.node.size.height)
    this._enteredNodes
      .append('div')
      .attr('class', 'text')
      .html(this._getLabel.bind(this))
  }
  /**
   * update DOM nodes
   */
  _updateNodes (items) {
    this._nodes
      .select('.text')
      .html(this._getLabel.bind(this))

    this._nodes.merge(this._enteredNodes)
      .select('.circle')
      .style('background', (key) => {
        if (_.includes(items.tags, key)) return '#ff00ff'
        if (_.includes(items.notes, key)) return '#00ff00'
        return 'rgb(215, 236, 251)'
      })
  }
  /**
   * remove DOM nodes
   */
  _exitNodes () {
    this._exitedNodes = this._nodes.exit()
    this._exitedNodes
      .classed(this.selectors.hidden.slice(1), true)
    setTimeout(() => {
      this._exitedNodes.remove()
    }, 750)
  }
  /**
   * update nodes and edges positions in DOM
   */
  _updatePosition () {
    const items = this._items
    const coords = this.layout.coords
    _.each(this._nodes.merge(this._enteredNodes).nodes(), (node) => {
      const $node = $(node)
      const item = node.__data__
      const coord = coords[items.indexOf(item)] || { x: 0, y: 0 }
      $node.translateX(coord.x)
      $node.translateY(coord.y)
    })
    const edgesCoords = this.layout.edgesCoords
    _.each(this._edges.merge(this._enteredEdges).nodes(), (edge, i) => {
      const coord = edgesCoords[i] || { x1: 0, y1: 0, x2: 0, y2: 0 }  // eslint-disable-line
      edge.setAttribute('x1', coord.x1)
      edge.setAttribute('y1', coord.y1)
      edge.setAttribute('x2', coord.x2)
      edge.setAttribute('y2', coord.y2)
    })
  }

  _getLabel (key) {
    let value = this.graph.get(key)
    value = value.substr(0, value.indexOf('\n')) || value
    if (value.length > this.p.node.label.maxLength) value = `${value.slice(0, 15)}...`
    return value
  }

  _onDrop (targetNode) {
    if (!targetNode) return
    this.actionman.get('itemLink').enable()
    this.actionman.get('itemLink').apply(targetNode[0].__data__)
  }

  _onNodeMove (delta) {
    const keys = this.selection.getAll()
    _.each(keys, (key) => {
      const node = _.find(
        this._nodes.merge(this._enteredNodes).nodes(),
        _node => _node.__data__ === key
      )
      if (!node.classList.contains('pin')) {
        d3.select(node)
          .classed('pin', true)
          .append('img')
          .attr('width', this.p.node.size.width / 2)
          .attr('height', this.p.node.size.width / 2)
          .attr('src', '/client/view/graph/pin.svg')
      }
      _(this.layout.nodes)
        .filter(['id', key])
        .each((n) => {
          n.x += delta.x
          n.y += delta.y
          n.fx = n.x
          n.fy = n.y
        })
      this.fixedNodes.add(key)
      this.layout.run()
    })
    this.selection.clear()
  }

  clearFixed () {
    this.fixedNodes.clear()
    d3.selectAll('.pin')
      .classed('pin', false)
      .select('img')
      .remove()
  }

  _onSelect (keys) {
    _.each(keys, (key) => {
      const node = _.find(
        this._nodes.merge(this._enteredNodes).nodes(),
        _node => _node.__data__ === key
      )

      if (node) node.classList.add(this.selectors.selected.slice(1))
    })
  }

  _onDeselect (keys) {
    _.each(keys, (key) => {
      const node = _.find(
        this._nodes.merge(this._enteredNodes).nodes(),
        _node => _node.__data__ === key
      )

      if (node) node.classList.remove(this.selectors.selected.slice(1))
    })
  }

  _onNodeDblClick (e) {
    const key = this.selection.getAll()
    this._reload(key, 1)
  }

  _addToSelection (key) {
    this.selection.add(key)
    this._reload()
  }

  _onClick () {
    this.emit('focus', this.name)
  }
  /**
   * @param id
   */

  async _reload (context = this.graph.context, depth = 1) {
    const response = await this.itemman.getGraphWithCoords(context, depth)
    this.coords = response.coords
    this.graph = response.graph
    this.graph.remove(context)
    this.render(this.graph, {})
  }
}
