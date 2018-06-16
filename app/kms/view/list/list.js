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
    this.graph = p.graph || {}
    this.coords = p.coords || {}
    this.$el = p.$el || undefined
    this.children = {}
    this.key = p.key

    this.actionman = p.actionman
    this.itemman = p.itemman

    this.itemman.on('item:create', this._updateGraph, this)
    this.itemman.on('item:remove', this._reload, this)
    const $html = $(template({ name: this.getSelectors(), context: this.context }))

    if (!this.transform) {
      this.$el = $('<div>')
      this.$el.append($html)
      this.setElement(this.$el)
    } else {
      const nodes = this.$el.find(`${this.selectors.node}`)
      nodes.detach()
      this.$el.removeClass()
      this.$el.empty()
      this.setElement($html, this.$el)
      nodes.appendTo(this.$el.find(`${this.selectors.canvas}`))
    }

    this.$el.addClass(`view list noselect ${this.getSelectors()}`)
    this.canvas = d3.select(`.${this.getSelectors()} ${this.selectors.canvas}`)

    this.rowViewSet = {
      actionman: this.actionman,
      itemman: this.itemman,
      container: this.elements.canvas,
    }
    this._initLayouts()
    this._initViewActions()

    this.selection.on('add', this._onSelect.bind(this))
    this.selection.on('remove', this._onDeselect.bind(this))
    this.$el.get(0).addEventListener('click', this._onClick.bind(this), true) // useCapture

    if (!this.transform) {
      this._reload()
    } else {
      this.render(this.graph)
    }
  }

  get selectors () {
    return _.extend(super.selectors, {
      canvas: '.canvas',
      node: '.view',
      hidden: '.hide',
      selected: '.selected',
      transform: '.transform',
      context: '.context',
      reset: '.reset',
    })
  }

  get events () {
    return _.extend(super.events, {
      'click transform': this._onTransform,
      'click reset': this.resetContext,
    })
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
    this.elements.canvas.addClass('behavior')

    this.drag = new Drag({
      container: this.elements.canvas,
      node: { selector: this.selectors.node },
      moveThreshold: 16,
    })
    this.drag.enable()
    this.drag.on('drop', this._onDrop.bind(this))
    this.drag.on('move', this._onNodeMove.bind(this))


    this.selectioning = new Selectioning({
      selection: this.selection,
      container: this.elements.canvas,
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
      $childNode.translate(coord.x, coord.y)
    })
  }

  render (graph) {
    this._items = graph.getItemKeys()

    // bind DOM nodes to items
    this._nodes = this.canvas
      .selectAll(this.selectors.node)
      .data(this._items, d => d)

    if (this.sequence === undefined) {
      this._sortByAlphabet(this._items)
    } else {
      this._items = this.sequence
    }


    this._enterNodes()
    this._updateNodes()
    this._exitNodes()

    this.layout.update(this._items)
    this.layout.run()
  }

  _sortByAlphabet (items) {
    const _items = _.cloneDeep(items)
    _items.sort()
    this._items = _items
  }

  _enterNodes () {
    this._enteredNodes = this._nodes.enter()
    _.each(this._enteredNodes.nodes(), (node) => {
      const key = node.__data__
      const value = this.graph.get(key)
      this.children[key] = new Row(_.assign({ value: key }, this.rowViewSet))
      this.children[key].$el.get(0).__data__ = key

      this.children[key].$el.addClass(() => {
        if (_.includes(this.selection.getAll(), key)) return 'selected'
        return ''
      })
    })
  }

  _updateNodes () {
    _.each(this._nodes.nodes(), (node) => {
      const key = node.__data__
      const value = this.graph.get(key)
      if (!this.transform) {
        this.children[key].render(value)
      } else {
        this.children[key] = new Row(_.assign({
          value: key,
          $el: $(node),
          transform: true,
        }, this.rowViewSet))

        this.children[key].$el.addClass(() => {
          if (_.includes(this.selection.getAll(), key)) return 'selected'
          return ''
        })
      }
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

  _onClick () {
    this.emit('focus', this.key)
  }

  _onDrop (targetNode) {
    if (!targetNode) return
    const droppedKeys = this.selection.getAll()
    const droppedPosition = this._items.indexOf(droppedKeys[0])
    _.each(droppedKeys, (key) => {
      this._items.splice(this._items.indexOf(key), 1)
    })
    let targetPosition = this._items.indexOf(targetNode[0].__data__)
    if (droppedPosition === targetPosition || droppedPosition < targetPosition) {
      targetPosition++
    }
    const sorted = []
    if (targetPosition === this._items.length) {
      sorted.push(...this._items)
      sorted.push(...droppedKeys)
    } else if (targetPosition === 0) {
      sorted.push(...droppedKeys)
      sorted.push(...this._items)
    } else {
      _.each(this._items, (key, index) => {
        if (index !== targetPosition) {
          sorted.push(key)
        } else {
          sorted.push(...droppedKeys)
          sorted.push(key)
        }
      })
    }
    this.sequence = sorted
    this.render(this.graph)
  }

  _onNodeMove (delta, dragged) {
    const droppedKeys = this.selection.getAll()

    const draggedPosition = this._items.indexOf(dragged.__data__)
    const draggedCoords = this.layout.coords[draggedPosition]
    const targetYCoord = draggedCoords.y + delta.y
    const _coords = _.cloneDeep(this.layout.coords)
    _.each(droppedKeys, (key) => {
      _coords.splice(this._items.indexOf(key), 1)
      this._items.splice(this._items.indexOf(key), 1)
    })

    const sorted = []
    if (_coords[_coords.length - 1].y < targetYCoord) {
      sorted.push(...this._items)
      sorted.push(...droppedKeys)
    } else if (_coords[0].y > targetYCoord) {
      sorted.push(...droppedKeys)
      sorted.push(...this._items)
    } else {
      let targetPosition
      _.each(_coords, (coords, index) => {
        if (coords.y > targetYCoord) {
          targetPosition = index
          return false
        }
      })

      _.each(this._items, (key, index) => {
        if (index !== targetPosition) {
          sorted.push(key)
        } else {
          sorted.push(...droppedKeys)
          sorted.push(key)
        }
      })
    }

    this.sequence = sorted
    this.render(this.graph)
  }

  _onTransform () {
    this.emit('transform', this.key, 'Graph')
  }

  removeListeners () {
    this.undelegateEvents()
    this.itemman.off('item:create', this._updateGraph, this)
    this.itemman.off('item:remove', this._reload, this)
  }

  resetContext () {
    this.context = [this.itemman.serviceItems.visibleItem]
    this.emit('context:change', this.key)
    this.elements.context.empty().append(this.context)
    this._reload()
  }

  async _reload (context = this.context, viewKey = this.key, depth = this.depth) {
    this.graph = await this.itemman.reloadGraph(context, depth)
    this.graph.remove(context)
    this.render(this.graph)
  }
}
