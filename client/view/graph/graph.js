/**
 * Graph view
 * Utilizes several layouts
 * Here comes logic for handling visual "GUI-level" user input
 * like: click, hover, collapse/expand, right click, etc
 */
import { Force } from '@graphiy/layout'
import { Selectioning, Pan, Drag } from '@graphiy/behavior'
import Util from '../../../core/util'

import View from '../view'
import Node from '../node/node'
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
  constructor (p) {
    super(p)
    this.graph = p.graph || {}
    this.coords = p.coords || {}
    this.$el = p.$el || undefined
    this.children = {}
    this.name = p.name
    this.key = p.key

    this.autoLayout = true
    this.actionman = p.actionman
    this.itemman = p.itemman
    this.itemman.on('repo:update', this._reload, this)
    this.itemman.on('coords:delete', this._updateView, this)
    this.itemman.on('item:create', this._updateGraph, this)
    this.itemman.on('item:associate', this._reload, this)
    this.itemman.on('item:disassociate', this._reload, this)
    this.itemman.on('item:remove', this._reload, this)
    this.itemman.on('item:showChildren', this._updateView, this)
    const $html = $(template({ name: this.name, context: this.context }))

    if (!this.transform) {
      this.$el = $('<div>')
      this.$el.append($html)
      this.$el.on('click', this._onClick.bind(this))
      this.setElement(this.$el)
    } else {
      this.$el.on('click', this._onClick.bind(this))
      const text = this.$el.find(`${this.selectors.node}`)
      text.detach()
      this.$el.removeClass()
      this.$el.empty()
      this.setElement($html, this.$el)
      text.appendTo(this.$el.find(`${this.selectors.nodeGroup}`))
    }

    this.$el.addClass(`view graph noselect ${this.name}`)
    this.canvas = d3.select(`.${this.name} ${this.selectors.canvas}`)
    this.svg = d3.select(`.${this.name} ${this.selectors.svg}`)

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

    this.nodeViewSet = {
      actionman: this.actionman,
      itemman: this.itemman,
      container: this.elements.nodeGroup,
      node: this.p.node,
    }
    this._initLayouts()
    this.resize()
    this._initViewActions()

    this.selection.on('add', this._onSelect.bind(this))
    this.selection.on('remove', this._onDeselect.bind(this))


    // $(window).on('resize', this.resize.bind(this))

    this._reload(this.context, this.key, this.depth)
  }

  get selectors () {
    return _.extend(super.selectors, {
      svg: 'svg',
      container: '.container',
      canvas: '.container .canvas',
      edgeGroup: '.edgeGroup',
      nodeGroup: '.nodeGroup',
      link: '.link',
      node: '.view',
      tag: '.tag',
      note: '.note',
      hidden: '.hide',
      selected: '.selected',
      transform: '.transform',
      text: '.text',
      context: '.context',
      close: '.close',
      reset: '.reset',
    })
  }

  get events () {
    return _.extend(super.events, {
      'dblclick container': this._onNodeDblClick,
      'click transform': this._onTransform,
      'click close': this.close,
      'click reset': this.resetContext,
    })
  }
  /**
   * initialize layout in view
   */
  _initLayouts () {
    const force = new Force({ distance: 100 })

    this.layout = force
    this.layout.on('end', this._updatePosition, this)

    if (this.transform) {
      this.layout.once('end', () => {
        _.each(this.children, (child) => {
          child.endTransform()
        })
      })
    }
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
  render (graph) {
    this._graph = graph
    this._items = graph.getItemKeys()

    // bind DOM nodes to items
    this._nodes = this.canvas.select(this.selectors.nodeGroup)
      .selectAll(this.selectors.node)
      .data(this._items, d => d)

    this._enterNodes()
    this._updateNodes()
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
      const item = { id: node, x: 0, y: 0 }
      if (this.coords && this.coords[node]) {
        coords = JSON.parse(this.coords[node])
        if (coords[this.constructor.name]) {
          data.push(_.assign({
            fx: coords[this.constructor.name].x,
            fy: coords[this.constructor.name].y,
          }, item))
        } else {
          data.push(item)
        }
      } else {
        data.push(item)
      }
    })

    this.layout.update(data, links)

    // init edges only after its coord are ready
    this._edges = this.svg.select(this.selectors.edgeGroup)
      .selectAll(this.selectors.link)
      .data(this._graph.getLinksArray())

    this._enterEdges()
    this._exitEdges()

    this.layout.once('end', () => {
      _.each(this._enteredNodes.nodes(), (node) => {
        const key = node.__data__
        this.children[key].$el.removeClass(`${this.selectors.hidden.slice(1)}`)
      })
      this._enteredEdges.classed(this.selectors.hidden.slice(1), false)
      this._exitedEdges.classed(this.selectors.hidden.slice(1), true)
      this.transform = false
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
    this._enteredNodes = this._nodes.enter()
    _.each(this._enteredNodes.nodes(), (node) => {
      const key = node.__data__
      const value = this._getLabel(key)
      this.children[key] = new Node(_.assign({ value: key }, this.nodeViewSet))
      this.children[key].$el.get(0).__data__ = key
      this.children[key].$el.addClass(`${this.selectors.hidden.slice(1)}`)
      this.children[key].$el.addClass(() => {
        if (_.includes(this.selection.getAll(), key)) return 'selected'
        return ''
      })
    })
  }
  /**
   * update DOM nodes
   */
  _updateNodes () {
    _.each(this._nodes.nodes(), (node) => {
      const key = node.__data__
      const value = this._getLabel(key)
      if (!this.transform ) {
        this.children[key].render(value)
      } else {
        this.children[key] = new Node(_.assign({
          value: key,
          $el: $(node),
          transform: true,
        }, this.nodeViewSet))

        this.children[key].$el.addClass(() => {
          if (_.includes(this.selection.getAll(), key)) return 'selected'
          return ''
        })

        if (_.includes(this.fixedNodes.getAll(), key)) {
          this.children[key].fixed = true
        }
      }
    })
  }
  /**
   * remove DOM nodes
   */
  _exitNodes () {
    this._exitedNodes = this._nodes.exit()
    _.each(this._exitedNodes.nodes(), (node) => {
      const key = node.__data__
      this.children[key].remove()
      delete this.children[key]
    })
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
      const key = node.__data__
      const coord = coords[items.indexOf(key)] || { x: 0, y: 0 }
      const $childNode = $(this.children[key].$el)
      $childNode.translate(coord.x, coord.y)
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

  _onDrop (targetNode, draggedNode) {
    if (!targetNode) return
    this.actionman.get('Link').enable()
    this.actionman.fire('Link', 'all', [targetNode[0].__data__, draggedNode[0].__data__])
  }

  _onNodeMove (delta) {
    const keys = this.selection.getAll()

    _.each(keys, (key) => {
      const newCoords = {}
      newCoords[this.constructor.name] = {}
      const node = _.find(
        this._nodes.merge(this._enteredNodes).nodes(),
        _node => _node.__data__ === key
      )

      if (!this.fixedNodes.get(key)) {
        this.children[key].addPin()
      }

      _(this.layout.nodes)
        .filter(['id', key])
        .each((n) => {
          n.x += delta.x
          n.y += delta.y
          n.fx = n.x
          n.fy = n.y
          newCoords[this.constructor.name].x = n.x
          newCoords[this.constructor.name].y = n.y
        })
      this.fixedNodes.add(key)
      this.coords[key] = JSON.stringify(newCoords)
      this.layout.run()
    })
  }

  clearFixed (keys) {
    this.fixedNodes.remove(keys)
    _.each(keys, (key) => {
      this.children[key].fixed = false
    })
  }

  _onSelect (keys) {
    _.each(keys, (key) => {
      if (this.children[key]) {
        this.children[key].$el.addClass(this.selectors.selected.slice(1))
      }
    })
  }

  _onDeselect (keys) {
    _.each(keys, (key) => {
      if (this.children[key]) {
        this.children[key].$el.removeClass(this.selectors.selected.slice(1))
      }
    })
  }

  _onNodeDblClick (e) {
    const depth = 1
    const key = this.selection.getAll()
    this.selection.clear()
    this._reload(key, this.key, depth)
    this.context = key
    this.depth = depth
    this.emit('context:change', this.key)
    this.elements.context.empty().append(key)
  }

  async _updateGraph (key) {
    this.selection.clear()
    await this._reload(this.context, this.key, this.depth)
    this.selection.add(key)
  }

  _onClick () {
    this.emit('focus', this.key)
  }

  _updateView (viewKey) {
    if (viewKey === this.key) this._reload(this.context, this.key, this.depth)
  }

  _onTransform () {
    this.emit('transform', this.key, 'List')
  }

  removeListeners () {
    this.undelegateEvents()
    this.itemman.off('repo:update', this._reload, this)
    this.itemman.off('coords:delete', this._updateView, this)
    this.itemman.off('item:create', this._updateGraph, this)
    this.itemman.off('item:associate', this._reload, this)
    this.itemman.off('item:disassociate', this._reload, this)
    this.itemman.off('item:remove', this._reload, this)
    this.itemman.off('item:showChildren', this._reload, this)
  }

  close () {
    this.emit('closeView', this.key)
  }

  resetContext () {
    this.context = [this.itemman.serviceItems.visibleItem]
    this.emit('context:change', this.key)
    this.elements.context.empty().append(this.context)
    this._reload()
  }

  async _reload (context = this.context, viewKey = this.key, depth = this.depth) {
    const response = await this.itemman.getGraphWithCoords(context, viewKey, depth)
    this.coords = response.coords
    this.graph = response.graph
    this.render(this.graph, {})
  }
}
