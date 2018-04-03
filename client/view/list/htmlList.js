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
    this.selection.on('change', this._onSelectionChange.bind(this))

    const name = this.name
    const $html = $(template({ name }))
    if (this.p.hidden) $html.css('display', 'none')
    this.setElement($html)
    this.canvas = d3.select(`.${this.name} ${this.selectors.canvas}`)

    this._reload()
  }

  get selectors () {
    return _.extend(super.selectors, {
      canvas: '.canvas',
      node: '.row',
    })
  }

  get events () {
    return _.extend(super.events, {
      'click node': this._onRowClick,
      'click canvas': this._onBackgroundClick,
    })
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
      const item = node.__data__
      const value = this.graph.get(item)
      this.children[item] = new Row(_.assign({ value }, rowViewSet))
      this.children[item].$el.get(0).__data__ = item
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

  _onRowClick (e) {
    const key = e.target.__data__
    if (!e.ctrlKey) this.selection.clear()
    this.selection.add(key)
    e.stopPropagation()
  }

  _onBackgroundClick () {
    this.selection.clear()
  }

  _onSelectionChange (selection) {
    this.canvas.selectAll(this.selectors.node)
      .each(function (d, i) {
        if (selection.includes(d)) {
          const node = d3.select(this)
          node.classed('selected', !node.classed('selected'))
        }
      })
  }

  async _reload (context, depth = 1) {
    this.graph = await this.itemman.reloadGraph(context, depth)
    this.graph.remove(context)
    this.render(this.graph)
  }
}
