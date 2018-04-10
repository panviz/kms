
import { Selectioning } from '@graphiy/behavior'
import View from '../view'
import Row from '../row/row'
import template from './list.html'
import './list.scss'


export default class HtmlList extends View {
  constructor (p) {
    super(p)
    this.graph = {}
    this.children = {}
    this.name = p.name
    this.key = p.key
    this.actionman = p.actionman
    this.itemman = p.itemman
    this.itemman.on('item:create', this._updateGraph.bind(this))
    this.itemman.on('item:remove', this._reload.bind(this))

    const name = this.name
    const $html = $(template({ name }))
    if (this.p.hidden) $html.css('display', 'none')
    this.setElement($html)
    this.canvas = d3.select(`.${this.name} ${this.selectors.canvas}`)

    this._initViewActions()
    this.selection.on('add', this._onSelect.bind(this))
    this.selection.on('remove', this._onDeselect.bind(this))

    this._reload()
  }

  get selectors () {
    return _.extend(super.selectors, {
      canvas: '.canvas',
      node: '.node',
      hidden: '.hide',
      selected: '.selected',
    })
  }

  get events () {
    return _.extend(super.events, {})
  }

  _initViewActions () {
    this.elements.canvas.addClass('behavior')
    this.selectioning = new Selectioning({
      selection: this.selection,
      container: this.elements.canvas,
      node: { selector: this.selectors.node },
    })
    this.selectioning.enable()
  }

  render (graph) {
    this._items = graph.getItemKeys()

    // bind DOM nodes to items
    this._nodes = this.canvas
      .selectAll(this.selectors.node)
      .data(this._items, d => d)

    this._enterNodes()
    this._updateNodes()
    this._exitNodes()
  }

  _enterNodes () {
    const rowViewSet = {
      actionman: this.actionman,
      itemman: this.itemman,
      container: this.elements.canvas,
    }

    this._enteredNodes = this._nodes.enter()
    _.each(this._enteredNodes.nodes(), (node) => {
      const key = node.__data__
      const value = this.graph.get(key)
      this.children[key] = new Row(_.assign({ value }, rowViewSet))
      this.children[key].$el.get(0).__data__ = key
    })

    this.canvas.selectAll(this.selectors.node)
      .style('position', 'relative')
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

  async _updateGraph (key) {
    this.selection.clear()
    await this._reload()
    this.selection.add(key)
  }

  _onSelect (keys) {
    _.each(keys, (key) => {
      const node = _.find(
        this._nodes.merge(this._enteredNodes).nodes(),
        _node => _node.__data__ === key
      )

      if (node) {
        this.children[node.__data__].$el.addClass(this.selectors.selected.slice(1))
      }
    })
  }

  _onDeselect (keys) {
    _.each(keys, (key) => {
      const node = _.find(
        this._nodes.merge(this._enteredNodes).nodes(),
        _node => _node.__data__ === key
      )

      if (node) {
        this.children[node.__data__].$el.removeClass(this.selectors.selected.slice(1))
      }
    })
  }

  async _reload (context, depth = 1) {
    this.graph = await this.itemman.reloadGraph(context, depth)
    this.graph.remove(context)
    this.render(this.graph)
  }
}
