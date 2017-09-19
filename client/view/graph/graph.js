/**
 * Graph view
 * Utilizes several layouts
 * Here comes logic for handling visual "GUI-level" user input
 * like: click, hover, collapse/expand, right click, etc
 */
import View from '../view'
import ForceLayout from '../../layout/force'
// import GridLayout from '../../layout/grid'
// import RadialLayout from '../../layout/radial'
import Selectioning from '../../behavior/selection/selectioning'
import RectSelectioning from '../../behavior/selection/rectangular'
import Pan from '../../behavior/pan/pan'
import Drag from '../../behavior/drag/drag'
import Util from '../../../core/util'
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

    const $html = $(template({ name: name }))
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

    this.resize()
    this._initLayouts()
    this._initViewActions()

    this.selection.on('add', this._onSelect.bind(this))
    this.selection.on('remove', this._onDeselect.bind(this))

    this.elements.canvas.on('click', this._onClick.bind(this))
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
    const forceLayout = new ForceLayout({
      width: this.p.width,
      height: this.p.height,
      node: this.p.node,
    })
    // const gridLayout = new GridLayout({
    // width: this.p.width,
    // height: this.p.height,
    // node: this.p.node.size,
    // offset: { x: this.p.node.size.width, y: this.p.node.size.height },
    // spacing: 100,
    // })
    // const radialLayout = new RadialLayout({
    // width: this.p.width,
    // height: this.p.height,
    // })
    this.layouts = {
      force: forceLayout,
      // grid: gridLayout,
      // radial: radialLayout,
    }

    // TODO change Grid and Radial layouts firing
    // this.actions = [
    // require('./action/forceLayout'),
    // require('./action/gridLayout'),
    // require('./action/radialLayout')
    // ]
    // _.each(this.actions, (action) => {
    // this.actionman.set(action, this)
    // })
    this.layout = this.layouts.force
    this.layout.on('tick', this._updatePosition, this)
  }

  /**
   * initialize View actions and their functions
   */
  _initViewActions () {
    this.elements.container.addClass('behavior')
    this.drag = new Drag({
      container: this.elements.container,
      node: this.p.node,
    })
    this.drag.enable()
    this.drag.on('drop', this._onDrop.bind(this))
    this.drag.on('move', this._onNodeMove.bind(this))

    this.pan = new Pan({
      container: this.elements.container,
      panElement: this.elements.canvas,
    })
    this.pan.enable()

    this.selectioning = new Selectioning({
      selection: this.selection,
      container: this.elements.container,
      nodeSelector: this.selectors.node,
    })
    /* this.rectSelectioning = new RectSelectioning({
      selection: this.selection,
      nodes: this._nodes,
      container: this.elements.root,
      // eventTarget: this.elements.svg,
      eventTarget: this.elements.container,
    }) */
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

    this.layout.update(graph, this._enteredNodes.nodes())

    // init edges only after its coord are ready
    this._edges = this.svg.select(this.selectors.edgeGroup)
      .selectAll(this.selectors.link)
      .data(this._graph.getLinksArray())

    this._enterEdges()
    this._exitEdges()

    this._updatePosition()
    this.layout.once('tick', () => {
      this._enteredNodes.classed(this.selectors.hidden.slice(1), false)
      this._enteredEdges.classed(this.selectors.hidden.slice(1), false)
      this._exitedNodes.classed(this.selectors.hidden.slice(1), true)
      this._exitedEdges.classed(this.selectors.hidden.slice(1), true)
    })

    this.updateLayout({ duration: 1000 })
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
  }

  /**
   * run current view layout for
   */
  updateLayout (p) {
    if (this.autoLayout) this.layout.run(p, this.graph)
  }

  /**
   * TODO make action for it
   */
  toggleAutoLayout () {
    this.autoLayout = !this.autoLayout
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
    const coords = this.layout.getCoords()
    _.each(this._nodes.merge(this._enteredNodes).nodes(), (node) => {
      const $node = $(node)
      const item = node.__data__
      const coord = coords[items.indexOf(item)]
      $node.translateX(coord.x)
      $node.translateY(coord.y)

      // if (item == 'job') console.log(coord.x + ', ' + coord.y);
    })
    _.each(this._edges.merge(this._enteredEdges).nodes(), (edge) => {
      const [source, target] = edge.__data__
      const sCoord = coords[items.indexOf(source)]
      const tCoord = coords[items.indexOf(target)]
      edge.setAttribute('x1', sCoord.x)
      edge.setAttribute('y1', sCoord.y)
      edge.setAttribute('x2', tCoord.x)
      edge.setAttribute('y2', tCoord.y)
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
      const node = _.find(this._nodes.merge(this._enteredNodes).nodes(),
        _node => _node.__data__ === key)
      const item = node.__data__

      if (!node.classList.contains('pin')) {
        d3.select(node)
          .classed('pin', true)
          .append('img')
          .attr('width', this.p.node.size.width / 2)
          .attr('height', this.p.node.size.width / 2)
          .attr('src', '/client/view/graph/pin.svg')

        // Fix item to dropped position
        this.layout.move(item, delta)
        this.layout.fix(item)
      }
    })
    this.updateLayout({ duration: 200 })
  }

  _onSelect (keys) {
    _.each(keys, (key) => {
      const node = _.find(this._nodes.merge(this._enteredNodes).nodes(),
        _node => _node.__data__ === key)

      if (node) node.classList.add(this.selectors.selected.slice(1))
    })
  }

  _onDeselect (keys) {
    _.each(keys, (key) => {
      const node = _.find(this._nodes.merge(this._enteredNodes).nodes(),
        _node => _node.__data__ === key)

      if (node) node.classList.remove(this.selectors.selected.slice(1))
    })
  }

  _onNodeDblClick (e) {
    this.actionman.get('itemShowChildren').apply(e)
  }

  _addToSelection (key) {
    this.selection.add(key)
    this._reload()
  }

  _onClick () {
    this.trigger('focus', this.name)
  }

  async _reload (context = this.graph.context) {
    this.graph = await this.itemman.reloadGraph(context, 1)
    this.graph.remove(context)
    this.render(this.graph, {})
  }
}
