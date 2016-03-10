/**
 * Client application is runned in browser
 */
var Provider = require('../provider/api.client/index')
, Search = require('./ui/search/search')
, Menu = require('./ui/main-menu/menu')
, GraphView = require('./view/graph/graph')
, ListView = require('./view/list/list')
, Editor = require('./view/editor/editor')
, ActionsPanel = require('./ui/actions-panel/panel')
, Collection = require('../core/collection')
, Actionman = require('./actionman')
, Util = require('../core/util')

var Self = function (p) {
  var self = this
  self.p = p || {}
  self.serviceItem = {
    visibleItem: {value: 'visibleItem'},
    searchItem: {},
  }

  self.selectors = {
    header: 'header',
    container: '.container',
    sidebar: '.sidebar',
  }
  self.elements = Util.findElements('body', self.selectors)

  self.selection = new Collection
  self.actionman = new Actionman()
  // IDs array of visible items
  self.visibleItems = new Collection

  var providerSet = {
    url: '/item'
  }
  self.provider = new Provider(providerSet)
  var graphViewSet = {
    actionman: self.actionman,
    container: self.elements.container,
    selection: self.selection,
  }
  var listViewSet = {
    actionman: self.actionman,
    container: self.elements.container,
    selection: self.selection,
    hidden: true,
  }
  var editorSet = {
    actionman: self.actionman,
    container: self.elements.container,
    hidden: true,
  }

  self.selection.on('change', self._onSelect.bind(self))
  self.search = new Search({container: self.elements.header})
  self.search.on('update', self._onSearch.bind(self))
  self.actionsPanel = new ActionsPanel({
    container: self.elements.sidebar,
    actions: self.actionman.getAll(),
  })
  self.actionman.on('add', self.actionsPanel.addMenuItem.bind(self.actionsPanel))

  self.graphView = new GraphView(graphViewSet)

  self.linkedList = new ListView(listViewSet)
  self.linkedList.on('show', self._layoutViews.bind(self))
  self.linkedList.on('hide', self._layoutViews.bind(self))

  self.editor = new Editor(editorSet)
  self.editor.on('hide', function () {
    self.actionman.get('itemSave').apply()
  })
  self.editor.on('show', self._layoutViews.bind(self))
  self.editor.on('hide', self._layoutViews.bind(self))

  self.actions = [
    require('./action/item/create'),
    require('./action/item/edit'),
    require('./action/item/save'),
    require('./action/item/link'),
    require('./action/item/unlink'),
    require('./action/item/showChildren'),
    require('./action/item/hide'),
    require('./action/item/remove'),
  ]
  _.each(self.actions, function (action) {
    self.actionman.set(action, self)
  })

  self._loadVisibleItems()
  self.menu = new Menu({container: self.elements.header})
}

Self.prototype.showChildren = function (keys) {
  var self = this
  keys = Util.pluralize(keys)
  //TODO multiple
  var rootKey = keys[0]
  self.provider.request('getGraph', rootKey, 1)
    .then(function (graph) {
      graph.remove(rootKey)
      self._filter(graph)
      var linkedKeys = graph.getItemKeys()
      self.visibleItems.add(linkedKeys)

      self.linkedList.show()
      // TODO when one view on common container is changed fire event and resize others
      self.linkedList.render(graph.getItemsMap())
    })
}

Self.prototype.createItem = function () {
  var self = this
  self.provider.request('set')
    .then(function (key) {
      self.visibleItems.add(key)
      self.selection.add(key)
    })
}

Self.prototype.editItem = function (key) {
  var self = this
  self.provider.request('get', key)
    .then(function (value) {
      self.editor.set(value, key)
      self.editor.show()
    })
}

Self.prototype.saveItem = function (value, key) {
  var self = this
  self.provider.request('set', value, key)
    .then(function (key) {
      if (key === key) {
        self.editor.saved()
        self._reloadGraph()
      }
    })
}

Self.prototype.removeItem = function (keys) {
  var self = this
  self.provider.request('remove', keys)
    .then(function (updated) {
      self.visibleItems.remove(keys)
    })
}

Self.prototype.linkItems = function (source, targets) {
  var self = this
  self.provider.request('associate', source, targets)
    .then(function (updated) {
      self._reloadGraph()
    })
}

Self.prototype.unlinkItems = function (source, targets) {
  var self = this
  self.provider.request('setDisassociate', source, targets)
    .then(function (updated) {
      self._reloadGraph()
    })
}
/**
 * populate view with user data from previous time
 */
Self.prototype._loadVisibleItems = function () {
  var self = this
  self.provider.request('set', self.serviceItem.visibleItem.value)
    .then(function (key) {
      self.serviceItem.visibleItem.key = key
      self.provider.request('getGraph', self.serviceItem.visibleItem.key, 1)
        .then(function (graph) {
          self._filter(graph)
          var keys = graph.getItemKeys()
          self.visibleItems.add(keys)
          self._updateGraphView(graph)
          self.visibleItems.on('change', self._reloadGraph.bind(self))
          self.visibleItems.on('add', self._onVisibleItemsAdd.bind(self))
          self.visibleItems.on('remove', self._onVisibleItemsRemove.bind(self))
        })
    })
}

Self.prototype._onSelect = function () {
  var self = this
  var keys = self.selection.getAll()
  if (keys.length === 1) {
    var key = keys[0]
    if (self.editor.isVisible()) {
      // TODO make local _graph.get and retrieve value only for partially loaded items
      self.provider.request('get', key)
        .then(function (value) {
          self.editor.set(value, key)
        })
    }
  } else if (keys.length === 0) self._hideSecondaryViews()
}
/**
 * Hide secondary views on empty selection
 */
Self.prototype._hideSecondaryViews = function () {
  var self = this
  self.editor.hide()
  self.linkedList.hide()
}

Self.prototype._layoutViews = function () {
  var self = this
  self.graphView.resize()
}

Self.prototype._onSearch = function (data) {
  var self = this
  self.provider.request('find', data.str, data.flags)
    .then(function (keys) {
      self.visibleItems.add(keys)
    })
}

Self.prototype._onVisibleItemsRemove = function (keys) {
  var self = this
  self.selection.remove(keys)
  self.provider.request('setDisassociate', self.serviceItem.visibleItem.key, keys)
}
/**
 * store visible item
 */
Self.prototype._onVisibleItemsAdd = function (keys) {
  var self = this
  self.provider.request('associate', self.serviceItem.visibleItem.key, keys)
}
/**
 * sync graph with server
 */
Self.prototype._reloadGraph = function () {
  var self = this
  var keys = self.visibleItems.getAll()
  self.provider.request('getGraph', keys)
    .then(function (graph) {
      self._updateGraphView(graph)
    })
}

Self.prototype._updateGraphView = function (graph) {
  var self = this
  self.graphView.render(graph)
}

Self.prototype._filter = function (data) {
  var self = this
  var graph, keys
  if (data.providerID) graph = data
  if (_.isArray(data)) keys = data
  if (graph) {
    graph.remove(self.serviceItem.visibleItem.key)
  } else {
    return _.without(keys, self.serviceItem.visibleItem.key) 
  }
}

var templates = G.Templates
G = new Self
G.Templates = templates
