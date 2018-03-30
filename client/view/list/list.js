/**
 * List view
 * Items are represented with rows
 * Use Grid layout for calculate coords
 */
import { Grid } from '@graphiy/layout'
import View from '../view'
import Row from '../row/row'
import template from './list.html'
import './list.scss'

export default class List extends View {
  constructor (p) {
    super(p)
    this.graph = {}
    this.children = {}
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
      canvas: '.canvas',
      node: '.node',
    })
  }

  get events () {
    return _.extend(super.events, {})
  }

  _initLayouts () {
    this.layoutConfig = {
      cell: {
        height: 20,
      },
      columns: 1,
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
      const item = node.__data__
      const coord = coords[items.indexOf(item)] || { x: 0, y: 0 }
      const $childNode = $(this.children[item].el)
      $childNode.translateX(coord.x)
      $childNode.translateY(coord.y)
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
    const rowViewSet = {
      actionman: this.actionman,
      itemman: this.itemman,
      container: this.elements.canvas,
    }

    this._enteredNodes = this._nodes.enter()
    _.each(this._enteredNodes.nodes(), (node) => {
      const item = node.__data__
      const value = this.graph.get(item)
      this.children[item] = new Row(_.assign({ value }, rowViewSet))
    })
  }

  _updateNodes () {
    _.each(this._nodes.nodes(), (node) => {
      const item = node.__data__
      const value = this.graph.get(item)
      this.children[item].render(value)
    })
  }

  _exitNodes () {
    this._exitedNodes = this._nodes.exit()
    _.each(this._exitedNodes.nodes(), (node) => {
      const item = node.__data__
      this.children[item].remove()
      delete this.children[item]
    })
    this._exitedNodes.remove()
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
