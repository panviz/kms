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
  constructor (p) {
    super(p)

    this.autoLayout = true
    this.actionman = p.actionman
    this.selection = p.selection

    const $html = $(template())
    this.p.container.append($html)
    this.elements = Util.findElements($html, this.selectors)

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
    this._graph = undefined

    this.canvas = d3.select(this.selectors.canvas)
    this.resize()
    this._initLayouts()
    this._initViewActions()

    this.selection.on('add', this._onSelect.bind(this))
    this.selection.on('remove', this._onDeselect.bind(this))
    this.elements.svg.on('dblclick', this.selectors.node, this._onNodeDblClick.bind(this))
    $(window).on('resize', this.resize.bind(this))
  }

  get selectors () {
    return {
      svg: 'svg',
      canvas: 'svg .canvas',
      edgeGroup: '.edgeGroup',
      nodeGroup: '.nodeGroup',
      link: '.link',
      node: '.node',
      tag: '.tag',
      note: '.note',
      hidden: '.hide',
      selected: '.selected',
    }
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
      //grid: gridLayout,
      //radial: radialLayout,
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
    this.elements.svg.addClass('behavior')
    this.drag = new Drag({
      container: this.elements.svg,
      node: this.p.node,
    })
    this.drag.enable()
    this.drag.on('drop', this._onDrop.bind(this))
    this.drag.on('move', this._onNodeMove.bind(this))

    this.pan = new Pan({
      container: this.elements.svg,
      panElement: this.elements.canvas,
    })
    this.pan.enable()

    this.selectioning = new Selectioning({
      selection: this.selection,
      container: this.elements.svg,
      nodeSelector: this.selectors.node,
    })
    this.rectSelectioning = new RectSelectioning({
      selection: this.selection,
      nodes: this._nodes,
      container: this.elements.root,
      eventTarget: this.elements.svg,
    })
  }
  /**
   * render new graph in the view using current layout
   */
  render (graph, links) {
    this._graph = graph

    this._items = graph.getItemKeys()

    // bind DOM nodes to items
    this._nodes = this.canvas.select(this.selectors.nodeGroup)
      .selectAll(this.selectors.node)
      .data(this._items, d => d)

    this._enterNodes()
    this._updateNodes(links)
    this._exitNodes()

    this.layout.update(graph, this._enteredNodes.nodes())

    // init edges only after its coord are ready
    this._edges = this.canvas.select(this.selectors.edgeGroup)
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
    //this.illuminationNodes(links)

  }
  /**
   * take all available space
   */
  resize () {
    this.elements.svg.detach()
    this.p.height = this.elements.root.height()
    this.p.width = this.elements.root.width()
    this.elements.root.append(this.elements.svg)
    this.elements.svg
      .width(this.p.width)
      .height(this.p.height)
  }
  /**
   * run current view layout for
   */
  updateLayout (p) {
    if (this.autoLayout) this.layout.run(p, this._graph)
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
    this._enteredNodes = this._nodes.enter().append('g')
    this._enteredNodes
      .classed(`${this.selectors.node.slice(1)} ${this.selectors.hidden.slice(1)}`, true)
      .classed(this.selectors.selected.slice(1), key => _.includes(this.selection.getAll(), key))
    this._enteredNodes
      .append('circle')
      .attr('r', this.p.node.size.width / 2)
    this._enteredNodes
      .append('text')
      .attr('x', this.p.node.size.width * 0.56)
      .attr('y', this.p.node.size.width * -0.19)
      .text(this._getLabel.bind(this))
  }
  /**
   * update DOM nodes
   */
  _updateNodes (links) {

    this._nodes
      .select('text')
      .text(this._getLabel.bind(this))


    this._nodes.merge(this._enteredNodes)
      .select('circle')
      .attr('fill', (key) => {
        if(_.indexOf(links.tags, key) != -1){
          return '#ff00ff'
        }
        if(_.indexOf(links.note, key) != -1){
          return '#00ff00'
        }
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
    let value = this._graph.get(key)
    value = value.substr(0, value.indexOf('\n')) || value
    if (value.length > this.p.node.label.maxLength) value = `${value.slice(0, 15)}...`
    return value
  }

  _onDrop (targetNode) {
    if (!targetNode) return
    this.actionman.get('itemLink').apply(targetNode[0].__data__)
  }

  _onNodeMove (delta) {
    const keys = this.selection.getAll()
    _.each(keys, (key) => {
      const node = _.find(this._nodes.merge(this._enteredNodes).nodes(), _node => _node.__data__ === key)
      const item = node.__data__
      d3.select(node).append('image')
        .attr('x', 0)
        .attr('y', -this.p.node.size.width * 0.68)
        .attr('width', this.p.node.size.width / 2)
        .attr('height', this.p.node.size.width / 2)
        .attr('xlink:href', '/client/view/graph/pin.svg')

      // Fix item to dropped position
      this.layout.move(item, delta)
      this.layout.fix(item)
    })
    this.updateLayout({ duration: 200 })
  }

  _onSelect (keys) {
    _.each(keys, (key) => {
      const node = _.find(this._nodes.merge(this._enteredNodes).nodes(), _node => _node.__data__ === key)
      if (node) node.classList.add(this.selectors.selected.slice(1))
    })
  }

  _onDeselect (keys) {
    _.each(keys, (key) => {
      const node = _.find(this._nodes.merge(this._enteredNodes).nodes(), _node => _node.__data__ === key)
      if (node) node.classList.remove(this.selectors.selected.slice(1))
    })
  }

  _onNodeDblClick (e) {
    this.actionman.get('itemShowChildren').apply()
  }

}
