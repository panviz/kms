/**
 * Client application is runned in browser
 */
var Provider = require('../provider/api.client/index')
, Search = require('./ui/search/search')
, GraphView = require('./view/graph/graph')
, ListView = require('./view/list/list')
, Editor = require('./view/editor/editor')
, ActionsPanel = require('./ui/actions-panel/panel')
, Selection = require('./behavior/selection')
, Actionman = require('./actionman')
, Util = require('../core/util')

var Self = function (p) {
  var self = this
  self.p = p || {}
  self.selectors = {
    container: '.container',
    headerPanel: '.header-panel',
  }
  self.serviceItem = {
    visibleItem: {value: 'visibleItem'},
    searchItem: {},
  }
  self.elements = Util.findElements('body', self.selectors)
  self.selection = new Selection
  // IDs array of visible items
  self.visibleItems = new Selection
  self.actionman = new Actionman({selection: self.selection})
  $act = self.actionman
  //self.tabs = new Tabs

  var providerSet = {
    url: '/item'
  }
  self.provider = new Provider(providerSet)
  var graphViewSet = {
    container: self.elements.container,
    selection: self.selection,
  }
  var listViewSet = {
    container: self.elements.container,
    selection: self.selection,
    hidden: true,
  }
  var editorSet = {
    container: self.elements.container,
    hidden: true,
  }

  self.selection.on('add', self._onSelect.bind(self))
  self.search = new Search({container: self.elements.headerPanel})
  self.search.on('update', self._onSearch.bind(self))
  self.actionsPanel = new ActionsPanel({
    container: self.elements.container,
    actions: self.actionman.getAll(),
  })

  self.graphView = new GraphView(graphViewSet)
  self.linkedList = new ListView(listViewSet)
  self.editor = new Editor(editorSet)
  self.graphView.on('item-dblclick', self.showChildren.bind(self))

  self.provider.request('set', self.serviceItem.visibleItem.value)
    .then(function (key) {
      self.serviceItem.visibleItem.key = key
      self.provider.request('getGraph', self.serviceItem.visibleItem.key, 1)
        .then(function (graph) {
          self._filter(graph)
          var keys = graph.getItemKeys()
          self.visibleItems.add(keys)
          self._updateGraphView(graph)
        })
    })
  self.visibleItems.on('change', self._onVisibleItemsChange.bind(self))
  self.visibleItems.on('add', self._onVisibleItemsAdd.bind(self))
  self.visibleItems.on('remove', self._onVisibleItemsRemove.bind(self))
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

      var vGraph = self._convert(graph)
      G.linkedList.show()
      // TODO when one view on common container is changed fire event and resize others
      G.graphView.resize()
      G.linkedList.render(vGraph)
    })
}

Self.prototype.editItem = function (key) {
  var self = this
  self.provider.request('get', key)
    .then(function (value) {
      self.editor.set(value)
      self.editor.show()
      self.graphView.resize()
    })
}

Self.prototype._onSelect = function (keys) {
  var self = this
  if (keys.length !== 1) return
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
  self.provider.request('setDisassociate', self.serviceItem.visibleItem.key, keys)
}

Self.prototype._onVisibleItemsAdd = function (keys) {
  var self = this
  self.provider.request('associate', self.serviceItem.visibleItem.key, keys)
}

Self.prototype._onVisibleItemsChange = function () {
  var self = this
  var keys = self.visibleItems.getAll()
  self.provider.request('getGraph', keys)
    .then(function (graph) {
      self._updateGraphView(graph)
    })
}
Self.prototype._updateGraphView = function (graph) {
  var self = this
  var vGraph = self._convert(graph)
  self.graphView.render(vGraph)
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
/**
 * Prepare suitable for Views json
 */
Self.prototype._convert = function (graph) {
  var self = this
  var obj = {}
  obj.items = _.map(graph.getItemsMap(), function (value, key) {
    return {key: key, value: value}
  })
  obj.links = _.map(graph.getLinksArray(), function (link) {
    return {source: link[0], target: link[1]}
  })
  obj.edges = self._getEdges(obj.items, obj.links)
  return obj
}
/**
 * @returns Array of formatted edges with nodes reference as source and target
 */
Self.prototype._getEdges = function (items, links) {
  var self = this
  return _.map(links, function (link) {
    var sourceNode = items.filter(function(n) {
      return n.key === link.source
    })[0],
      targetNode = items.filter(function(n) {
        return n.key === link.target
      })[0]

    return {
      source: sourceNode,
      target: targetNode,
      value: link.Value
    }
  })
}

var templates = G.Templates
G = new Self
G.Templates = templates
