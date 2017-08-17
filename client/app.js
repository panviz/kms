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
    this.provider.request('getGraph', rootKey, 1)
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

  createItem (p = {}) {
    const selected = this.selection.getAll()
    let updatesCounter = selected.length
    this.provider.request('set')
      .then((key) => {
        if (!_.isEmpty(selected)) {
          _.each(selected, (relatedKey) => {
            this.provider.request('associate', key, relatedKey)
              .then((updated) => {
                --updatesCounter
                if (updatesCounter === 0) this.visibleItems.add(key)
              })
          })
        } else {
          this.visibleItems.add(key)
          this.selection.add(key)
        }
        if (p === 'tag') {
          this.provider.request('associate', key, this.serviceItem.tag)
          this.tagItems.add(key)
        }
        if (p === 'note') {
          this.provider.request('associate', key, this.serviceItem.note)
          this.noteItems.add(key)
        }
      })
  }

  editItem (key) {
    this.provider.request('get', key)
      .then((value) => {
        this.ui.editor.set(value, key)
        this.ui.editor.setTitle('Edit item')
        this.ui.editor.show()
      })
  }

  saveItem (value, key) {
    this.provider.request('set', value, key)
      .then((_key) => {
        if (_key === key) {
          this.ui.editor.saved()
          this._reloadGraph()
        }
      })
  }

  removeItem (keys) {
    this.provider.request('remove', keys)
      .then((updated) => {
        this.visibleItems.remove(keys)
      })
  }

  linkItems (source, targets) {
    this.provider.request('associate', source, targets)
      .then((updated) => {
        this._reloadGraph()
      })
  }

  unlinkItems (source, targets) {
    this.provider.request('setDisassociate', source, targets)
      .then((updated) => {
        this._reloadGraph()
      })
  }

  visibleLinked (parent) {
    return this._graph.getLinked(parent)
  }

  /**
   * Populate view with user data from previous time
   */
  async _loadRepo () {
    try {
      let graph = await this.provider.request('getGraph', this.rootKey, 1)
      if (_.isEmpty(graph.getItemsMap())) await this._initRepo()
      else {
        _.each(this._serviceItems.concat(this._itemtypes), (item) => {
          this.serviceItem[item] = graph.search(this.rootKey, item)[0]
        })
        this.serviceItem.root = this.rootKey
      }

      graph = await this.provider.request('getGraph', this.serviceItem.visibleItem, 1)

      const tagKeys = await this.provider.request('getLinked', this.serviceItem.tag)
      const noteKeys = await this.provider.request('getLinked', this.serviceItem.note)
      this._filter(graph)
      this._filter(tagKeys)
      this._filter(noteKeys)
      const keys = graph.getItemKeys()
      this.visibleItems.add(keys)
      this.tagItems.add(tagKeys)
      this.noteItems.add(noteKeys)
      this._updateGraphView(graph, { tags: tagKeys, notes: noteKeys })

      this.visibleItems.on('change', this._reloadGraph.bind(this))
      this.visibleItems.on('add', this._onVisibleItemsAdd.bind(this))
      this.visibleItems.on('remove', this._onVisibleItemsRemove.bind(this))
    } catch (e) {
      console.error(e)
    }
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
}

window.G = new App()
