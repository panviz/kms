/**
 * List view
 * Items are represented with rows
 * Use Grid layout for calculate coords
 */
import { Grid } from '@graphiy/layout'
import { Selectioning, Drag } from '@graphiy/behavior'
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
    this.itemman.on('item:create', this._updateGraph.bind(this))
    this.itemman.on('item:remove', this._reload.bind(this))

    const name = this.name
    const $html = $(template({ name }))
    if (this.p.hidden) $html.css('display', 'none')
    this.setElement($html)
    this.canvas = d3.select(`.${this.name} ${this.selectors.canvas}`)

    this._initLayouts()
    this._initViewActions()

    this.selection.on('add', this._onSelect.bind(this))
    this.selection.on('remove', this._onDeselect.bind(this))
    this.elements.container.on('click', this._onClick.bind(this))

    this._reload()
  }

  get selectors () {
    return _.extend(super.selectors, {
      container: '.container',
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
      },
      columns: 1,
      name: 'List',
    }
    const list = new Grid(this.layoutConfig)

    this.layout = list
    this.layout.on('end', this._updatePosition, this)
  }

  _initViewActions () {
    this.elements.container.addClass('behavior')

    this.drag = new Drag({
      container: this.elements.container,
      node: { selector: this.selectors.node },
      moveThreshold: 16,
    })
    this.drag.enable()
    this.drag.on('drop', this._onDrop.bind(this))


    this.selectioning = new Selectioning({
      selection: this.selection,
      container: this.elements.container,
      node: { selector: this.selectors.node },
    })
    this.selectioning.enable()
  }

  _updatePosition () {
    const items = this._items
    const coords = this.layout.coords
    _.each(this._nodes.merge(this._enteredNodes).nodes(), (node) => {
      const item = node.__data__
      const coord = coords[items.indexOf(item)] || { x: 0, y: 0 }
      const $childNode = $(this.children[item].$el)
      $childNode.translateX(coord.x)
      $childNode.translateY(coord.y)
    })
  }

  render (graph) {
    this._items = graph.getItemKeys()

    // bind DOM nodes to items
    this._nodes = this.canvas
      .selectAll(this.selectors.node)
      .data(this._items, d => d)

    // sorted rows by saved positions
    this._sortedByPosition(this._items)
    const diff = this._collapseItemsArr(this._items)
    if (Object.keys(diff).length > 0) {
      this.itemman.saveCoords(diff, this.key)
    }

    this._enterNodes()
    this._updateNodes()
    this._exitNodes()

    this.layout.update(this._items)
    this.layout.run()
  }

  _sortedByPosition (items) {
    const sortedItems = []
    const _items = _.cloneDeep(items)
    _.each(this.coords, (coord, key) => {
      try {
        const position = JSON.parse(coord).position
        sortedItems[position] = key
        const index = _items.indexOf(key)
        if (index !== -1) {
          _items.splice(index, 1)
        }
      } catch (e) {
        console.log('Wrong coords format') // eslint-disable-line
      }
    })
    sortedItems.push(..._items)
    this._items = sortedItems
  }

  _collapseItemsArr (items) {
    const _items = _.cloneDeep(items)
    const collapsedArr = []
    const diff = {}
    let i = 0
    _.each(_items, (item, index) => {
      if (item !== undefined) {
        collapsedArr.push(item)
        if (i !== index) {
          diff[item] = { position: i }
        }
        i++
      }
    })
    this._items = collapsedArr
    return diff
  }

  _enterNodes () {
    const rowViewSet = {
      actionman: this.actionman,
      itemman: this.itemman,
      container: this.elements.canvas,
    }

    const coords = {}
    this._enteredNodes = this._nodes.enter()
    _.each(this._enteredNodes.nodes(), (node) => {
      const key = node.__data__
      const value = this.graph.get(key)
      this.children[key] = new Row(_.assign({ value }, rowViewSet))
      this.children[key].$el.get(0).__data__ = key

      if (!this.coords[key]) {
        coords[key] = { position: Object.keys(this.children).length - 1 }
      }
    })

    if (Object.keys(coords).length > 0) {
      this.itemman.saveCoords(coords, this.key)
    }
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

  _onClick () {
    this.emit('focus', this.name)
  }

  _onDrop (targetNode, draggedNode) {
    if (!targetNode) return
    const keys = this.selection.getAll()

    const targetPosition = this._items.indexOf(targetNode[0].__data__)

    // меняем местами
    let firstPart = this._items.slice(0, targetPosition)
    const lastPart = this._items.slice(targetPosition)
    firstPart = firstPart.concat(keys)

    _.each(keys, (key) => {
      lastPart.splice(lastPart.indexOf(key), 1)
    })

    this._items = firstPart.concat(lastPart)

    // обновить this.coords на основании this._items
    const coordsForSave = {}
    _.each(this._items, (item, index) => {
      this.coords[item] = `{"position":${index}}`
      coordsForSave[item] = { position: index }
    })
    this.itemman.saveCoords(coordsForSave, this.key)
    this.render(this.graph)
  }

  async _reload (context, viewKey = this.key, depth = 1) {
    const response = await this.itemman.getGraphWithCoords(context, viewKey, depth)
    this.coords = response.coords
    this.graph = response.graph
    this.graph.remove(context)
    this.render(this.graph)
  }
}
