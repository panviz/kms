/**
 * Client application is run in browser
 */
import Util from '../core/util'
import ClientUtil from './util' //eslint-disable-line
import Provider from '../provider/api.client/index'
import Collection from '../core/collection'
import UI from './ui/ui'
import Graph from '../provider/graph/index'
import './style/index.scss'

class App {
  constructor () {
    this.rootKey = '000000001vGeH72LxVtxKg'
    this._itemtypes = ['tag', 'note']
    this._serviceItems = ['root', 'visibleItem', 'itemtype']
    this.serviceItem = {}

    this.selection = new Collection()

    // IDs array of visible items
    this.visibleItems = new Collection()
    this.tagItems = new Collection()
    this.noteItems = new Collection()
    const providerSet = {
      url: '/item',
    }
    this.provider = new Provider(providerSet)

    this.selection.on('change', this._onSelect.bind(this))
    this.ui = new UI({ itemman: this, selection: this.selection })

    this._loadRepo()
  }

  showChildren (keyS) {
    const keys = Util.pluralize(keyS)

    // TODO multiple
    const rootKey = keys[0]
    this._request('getGraph', rootKey, 1)
      .then((graph) => {
        graph.remove(rootKey)
        this._filter(graph)
        const linkedKeys = graph.getItemKeys()
        this.visibleItems.add(linkedKeys)

        this.ui.linkedList.setTitle('Show children')
        this.ui.linkedList.show()

        // TODO when one view on common container is changed fire event and resize others
        this.ui.linkedList.render(graph.getItemsMap())
      })
  }

  async createItem (p = {}) {
    const selected = this.selection.getAll()
    await this._request('createAndLinkItem', _.concat(this.serviceItem.visibleItem, this.serviceItem[p], selected))
    const graph = await this._request('getGraph', this.serviceItem.visibleItem, 1)
    this._filter(graph)
    this._updateGraphView(graph, { tags: [], notes: [] })
  }

  async editItem (key) {
    const value = await this._request('get', key)
    this.ui.editor.set(value, key)
    this.ui.editor.setTitle('Edit item')
    this.ui.editor.show()
  }

  async saveItem (value, key) {
    const _key = await this._request('set', value, key)
    if (_key === key) {
      this.ui.editor.saved()
      const graph = await this._request('getGraph', this.serviceItem.visibleItem, 1)
      this._filter(graph)
      this._updateGraphView(graph, { tags: [], notes: [] })
    }
  }

  async removeItem (keys) {
    await this._request('remove', keys)
    const graph = await this._request('getGraph', this.serviceItem.visibleItem, 1)
    this._filter(graph)
    this._updateGraphView(graph, { tags: [], notes: [] })
  }

  async linkItems (source, targets) {
    await this._request('associate', source, targets)
    const graph = await this._request('getGraph', this.serviceItem.visibleItem, 1)
    this._filter(graph)
    this._updateGraphView(graph, { tags: [], notes: [] })
  }

  // todo не работает множественное разеденение
  async unlinkItems (source, targets) {
    this._request('setDisassociate', source, targets)
    const graph = await this._request('getGraph', this.serviceItem.visibleItem, 1)
    this._filter(graph)
    this._updateGraphView(graph, { tags: [], notes: [] })
  }

  visibleLinked (parent) {
    return this._graph.getLinked(parent)
  }
  /**
   * Populate view with user data from previous time
   */
  async _loadRepo () {
    let graph = await this._request('getGraph', this.rootKey, 1)
    if (_.isEmpty(graph.getItemsMap())) {
      await this._initRepo()
    } else {
      _.each(this._serviceItems.concat(this._itemtypes), (item) => {
        this.serviceItem[item] = graph.search(this.rootKey, item)[0]
      })
      this.serviceItem.root = this.rootKey
    }
    // получаем все для обработки иконок
    graph = await this._request('getGraph', [this.serviceItem.visibleItem,
      this.serviceItem.tag,
      this.serviceItem.note], 1)
    this._filter(graph)
    this._updateGraphView(graph, { tags: [], notes: [] })
  }

  _initRepo () {
    const graph = new Graph
    graph.set('root', this.rootKey)
    _.each(this._serviceItems.concat(this._itemtypes), (item) => {
      if (item === 'root') return
      this.serviceItem[item] = graph.set(item)
      graph.associate(this.rootKey, this.serviceItem[item])
      if (this._itemtypes.includes(item)) {
        graph.associate(this.serviceItem.itemtype, this.serviceItem[item])
      }
    })
    return this.provider.request('merge', graph)
  }

  _onSelect () {
    const keys = this.selection.getAll()
    if (keys.length === 1) {
      const key = keys[0]
      if (this.ui.editor.isVisible()) {
        // TODO make local _graph.get and retrieve value only for partially loaded items
        this.provider.request('get', key)
          .then((value) => {
            this.ui.editor.set(value, key)
          })
      }
    } else if (keys.length === 0) this.ui.hideSecondaryViews()
  }

  _onVisibleItemsRemove (keys) {
    this.selection.remove(keys)
    this.provider.request('setDisassociate', this.serviceItem.visibleItem, keys)
  }
  /**
   * Store visible item
   */
  _onVisibleItemsAdd (keys) {
    this.provider.request('associate', this.serviceItem.visibleItem, keys)
  }
  /**
   * Sync graph with server
   */
  _reloadGraph () {
    // TODO get only required notes and tags
    const keys = this.visibleItems.getAll()
    const tagItems = this.tagItems.getAll()
    const noteItems = this.noteItems.getAll()
    this.provider.request('getGraph', keys)
      .then((graph) => {
        this._updateGraphView(graph, { tags: tagItems, notes: noteItems })
      })
  }

  _updateGraphView (graph, itemsKeys) {
    this._graph = graph
    this.ui.graphView.render(graph, itemsKeys)
  }

  _filter (data) {
    let graph
    let keys
    const serviceKeys = _.toArray(this.serviceItem)
    if (data.providerID) graph = data
    if (_.isArray(data)) keys = data
    if (graph) {
      graph.remove(serviceKeys)
      return graph
    }
    _.pullAll(keys, serviceKeys)
    return keys
  }

  /**
   * Translate graph function calls to server
   */
  _request (method, ...args) {
    const promise = new Promise((resolve, reject) => {
      const request = $.post({
        url: '/graph/',
        data: {
          method,
          args: JSON.stringify(args),
        },
      })
      request.then((data) => {
        const graph = data.items && data.links ? new Graph(data) : data
        resolve(graph)
      })
    })
    return promise
  }
}

window.G = new App()
