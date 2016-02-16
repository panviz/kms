/**
 * Client application is runned in browser
 */
var Provider = require('../provider/api.client/index')
, GraphView = require('./view/graph/index')
, ListView = require('./view/list/index')
, Search = require('./ui/search/search')
, ActionsPanel = require('./ui/actions-panel/panel')
, Selection = require('./behavior/selection')
, Itemman = require('./itemman')
, Actionman = require('./actionman')
, Utils = require('../core/util')

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
  self.elements = Utils.findElements('body', self.selectors)
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
  }

  self.selection.on('add', self._onSelect.bind(self))
  self.search = new Search({container: self.elements.headerPanel})
  self.search.on('update', self._onSearch.bind(self))
  self.actionsPanel = new ActionsPanel({
    container: self.elements.container,
    actions: self.actionman.getAll(),
  })

  self.listView = new ListView(listViewSet)
  self.graphView = new GraphView(graphViewSet)

  self.provider.request('set', self.serviceItem.visibleItem.value)
    .then(function (key) {
      self.serviceItem.visibleItem.key = key
      self.provider.request('getGraph', self.serviceItem.visibleItem.key, 1)
        .then(function (graph) {
          var keys = graph.getItemKeys()
          keys = self._filter(keys)
          self.visibleItems.add(keys)
          self._renderViews(graph)
        })
    })
  self.visibleItems.on('change', self._onVisibleItemsChange.bind(self))
  self.visibleItems.on('add', self._onVisibleItemsAdd.bind(self))
}

Self.prototype._onSelect = function (keys) {
  var self = this
  if (keys.length !== 1) return
  self.provider.request('getLinked', keys[0])
    .then(function (keys) {
      keys = self._filter(keys)
      self.visibleItems.add(keys)
    })
}

Self.prototype._onVisibleItemsAdd = function (keys) {
  var self = this
  self.provider.request('associateGroup', self.serviceItem.visibleItem.key, keys)
}

Self.prototype._onSearch = function (data) {
  var self = this
  self.provider.request('find', data.str, data.flags)
    .then(function (keys) {
      self.visibleItems.add(keys)
    })
}

Self.prototype._onVisibleItemsChange = function () {
  var self = this
  var keys = self.visibleItems.getAll()
  self.provider.request('getGraph', keys)
    .then(function (graph) {
      self._renderViews(graph)
    })
}
Self.prototype._renderViews = function (graph) {
  var self = this
  var vGraph = self._convert(graph)
  self.graphView.render(vGraph)
  self.listView.render(vGraph)
}
Self.prototype._filter = function (keys) {
  var self = this
  return _.without(keys, self.serviceItem.visibleItem.key) 
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
