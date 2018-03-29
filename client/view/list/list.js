/**
 * List view
 * Items are represented with rows
 */
import { Grid } from '@graphiy/layout'
import View from '../view'
import template from './list.html'
import './list.scss'

export default class List extends View {
  constructor (p) {
    super(p)
    this.graph = {}
    this.name = p.name
    this.key = p.key
    this.actionman = p.actionman
    this.itemman = p.itemman
    this.itemman.on('item:create', this._addToSelection.bind(this))
    this.itemman.on('item:remove', this._reload.bind(this))

    const name = this.name
    const $html = $(template({ name }))
    if (this.p.hidden) $html.css('display', 'none')
    this.setElement($html)
    this.canvas = d3.select(`.${this.name} ${this.selectors.canvas}`)

    this._initLayouts()
    this._reload()
  }

  get selectors () {
    return _.extend(super.selectors, {
      list: '.items-list',
      canvas: '.canvas',
      node: '.node',
      hidden: '.hide',
      selected: '.selected',
    })
  }

  get events () {
    return _.extend(super.events, {})
  }

  _initLayouts () {
    this.layoutConfig = {
      cell: {
        height: 20,
        width: 20,
      },
      columns: 1,
      rows: 1,
      name: 'List',
    }
    const list = new Grid(this.layoutConfig)

    this.layout = list
    this.layout.on('end', this._updatePosition, this)
  }

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
  }

  render (graph) {
    this._graph = graph
    this._items = graph.getItemKeys()
    const nodes = this.graph.getItemKeys()

    // bind DOM nodes to items
    this._nodes = this.canvas
      .selectAll(this.selectors.node)
      .data(this._items, d => d)

    this._enterNodes()
    this._updateNodes()
    this._exitNodes()

    this.layout.update(nodes)
    this.layout.run()
  }

  _enterNodes () {
    this._enteredNodes = this._nodes.enter().append('div')
    this._enteredNodes
      .classed(`${this.selectors.node.slice(1)} ${this.selectors.hidden.slice(1)}`, true)
      .classed(this.selectors.selected.slice(1), key => _.includes(this.selection.getAll(), key))

    this._enteredNodes
      .attr('class', 'node')
      .style('width', '100%')
      .style('height', this.layoutConfig.cell.height)
      .html(this._getLabel.bind(this))
  }

  _updateNodes () {
    this._nodes
      .html(this._getLabel.bind(this))
  }

  _exitNodes () {
    this._exitedNodes = this._nodes.exit()
    this._exitedNodes
      .classed(this.selectors.hidden.slice(1), true)
    setTimeout(() => {
      this._exitedNodes.remove()
    }, 750)
  }

  _getLabel (key) {
    let value = this.graph.get(key)
    value = value.substr(0, value.indexOf('\n')) || value
    return value
  }

  _addToSelection (key) {
    this.selection.add(key)
    this._reload()
  }

  async _reload (context, depth = 1) {
    this.graph = await this.itemman.reloadGraph(context, depth)
    this.graph.remove(context)
    this.render(this.graph)
  }
}
