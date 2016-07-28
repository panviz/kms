/**
 * Client application is runned in browser
 */
import Provider from '../provider/api.client/index'
import Search from './ui/search/search'
import Menu from './ui/main-menu/menu'
import GraphView from './view/graph/graph'
import ListView from './view/list/list'
import Editor from './view/editor/editor'
import ActionsPanel from './ui/actions-panel/panel'
import Collection from '../core/collection'
import Actionman from './actionman'
import Util from '../core/util'
const _actions = [
  require('./action/item/create').default,
  require('./action/item/edit').default,
  require('./action/item/save').default,
  require('./action/item/link').default,
  require('./action/item/unlink').default,
  require('./action/item/showChildren').default,
  require('./action/item/hide').default,
  require('./action/item/remove').default,
]

class Self {
  constructor () {
    this.serviceItem = {
      visibleItem: { value: 'visibleItem' },
      searchItem: {},
    }

    this.selectors = {
      header: 'header',
      container: '.container',
      sidebar: '.sidebar',
    }
    this.elements = Util.findElements('body', this.selectors)

    this.selection = new Collection()
    this.actionman = new Actionman()

    // IDs array of visible items
    this.visibleItems = new Collection()

    const providerSet = {
      url: '/item',
    }
    this.provider = new Provider(providerSet)
    const graphViewSet = {
      actionman: this.actionman,
      container: this.elements.container,
      selection: this.selection,
    }
    const listViewSet = {
      actionman: this.actionman,
      container: this.elements.container,
      selection: this.selection,
      hidden: true,
    }
    const editorSet = {
      actionman: this.actionman,
      container: this.elements.container,
      hidden: true,
    }

    this.selection.on('change', this._onSelect.bind(this))
    this.search = new Search({ container: this.elements.header })
    this.search.on('update', this._onSearch.bind(this))
    this.actionsPanel = new ActionsPanel({
      container: this.elements.sidebar,
      actions: this.actionman.getAll(),
    })
    this.actionman.on('add', this.actionsPanel.addMenuItem.bind(this.actionsPanel))

    this.graphView = new GraphView(graphViewSet)

    this.linkedList = new ListView(listViewSet)
    this.linkedList.on('show', this._layoutViews.bind(this))
    this.linkedList.on('hide', this._layoutViews.bind(this))

    this.editor = new Editor(editorSet)
    this.editor.on('hide', () => {
      this.actionman.get('itemSave').apply()
    })
    this.editor.on('show', this._layoutViews.bind(this))
    this.editor.on('hide', this._layoutViews.bind(this))

    this.actions = _actions
    _.each(this.actions, action => this.actionman.set(action, this))

    this._loadVisibleItems()
    this.menu = new Menu({ container: this.elements.header })
  }

  showChildren (keyS) {
    const keys = Util.pluralize(keyS)

    // TODO multiple
    const rootKey = keys[0]
    this.provider.request('getGraph', rootKey, 1)
      .then(graph => {
        graph.remove(rootKey)
        this._filter(graph)
        const linkedKeys = graph.getItemKeys()
        this.visibleItems.add(linkedKeys)

        this.linkedList.show()

        // TODO when one view on common container is changed fire event and resize others
        this.linkedList.render(graph.getItemsMap())
      })
  }

  createItem () {
    this.provider.request('set')
      .then(key => {
        this.visibleItems.add(key)
        this.selection.add(key)
      })
  }

  editItem (key) {
    this.provider.request('get', key)
      .then(value => {
        this.editor.set(value, key)
        this.editor.show()
      })
  }

  saveItem (value, key) {
    this.provider.request('set', value, key)
      .then(_key => {
        if (_key === key) {
          this.editor.saved()
          this._reloadGraph()
        }
      })
  }

  removeItem (keys) {
    this.provider.request('remove', keys)
      .then(updated => {
        this.visibleItems.remove(keys)
      })
  }

  linkItems (source, targets) {
    this.provider.request('associate', source, targets)
      .then(updated => {
        this._reloadGraph()
      })
  }

  unlinkItems (source, targets) {
    this.provider.request('setDisassociate', source, targets)
      .then(updated => {
        this._reloadGraph()
      })
  }
  /**
   * Populate view with user data from previous time
   */
  _loadVisibleItems () {
    this.provider.request('set', this.serviceItem.visibleItem.value)
      .then(key => {
        this.serviceItem.visibleItem.key = key
        this.provider.request('getGraph', this.serviceItem.visibleItem.key, 1)
          .then(graph => {
            this._filter(graph)
            const keys = graph.getItemKeys()
            this.visibleItems.add(keys)
            this._updateGraphView(graph)
            this.visibleItems.on('change', this._reloadGraph.bind(this))
            this.visibleItems.on('add', this._onVisibleItemsAdd.bind(this))
            this.visibleItems.on('remove', this._onVisibleItemsRemove.bind(this))
          })
      })
  }

  _onSelect () {
    const keys = this.selection.getAll()
    if (keys.length === 1) {
      const key = keys[0]
      if (this.editor.isVisible()) {
        // TODO make local _graph.get and retrieve value only for partially loaded items
        this.provider.request('get', key)
          .then(value => {
            this.editor.set(value, key)
          })
      }
    } else if (keys.length === 0) this._hideSecondaryViews()
  }
  /**
   * Hide secondary views on empty selection
   */
  _hideSecondaryViews () {
    this.editor.hide()
    this.linkedList.hide()
  }

  _layoutViews () {
    this.graphView.resize()
  }

  _onSearch (data) {
    this.provider.request('find', data.str, data.flags)
      .then(keys => {
        this.visibleItems.add(keys)
      })
  }

  _onVisibleItemsRemove (keys) {
    this.selection.remove(keys)
    this.provider.request('setDisassociate', this.serviceItem.visibleItem.key, keys)
  }
  /**
   * Store visible item
   */
  _onVisibleItemsAdd (keys) {
    this.provider.request('associate', this.serviceItem.visibleItem.key, keys)
  }
  /**
   * Sync graph with server
   */
  _reloadGraph () {
    const keys = this.visibleItems.getAll()
    this.provider.request('getGraph', keys)
      .then(graph => {
        this._updateGraphView(graph)
      })
  }

  _updateGraphView (graph) {
    this.graphView.render(graph)
  }

  _filter (data) {
    let graph
    let keys
    if (data.providerID) graph = data
    if (_.isArray(data)) keys = data
    if (graph) {
      graph.remove(this.serviceItem.visibleItem.key)
      return graph
    }
    return _.without(keys, this.serviceItem.visibleItem.key)
  }
}

const templates = G.Templates
G = new Self()
G.Templates = templates
