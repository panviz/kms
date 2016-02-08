/**
 * Client application is runned in browser
 */
var Provider = require('../provider/api.client/index'),
GraphView = require('./view/graph/index'),
ListView = require('./view/list/index'),
Search = require('./ui/search/search'),
Selection = require('./behavior/selection'),
Itemman = require('./itemman'),
Utils = require('../core/util')

var Self = function (p) {
  var self = this
  self.p = p || {}
  self.selectors = {
    container: '.container',
    panel: '.panel',
  }
  self.elements = Utils.findElements('body', self.selectors)
  self.selection = new Selection
  self.itemman = new Itemman

  var providerSet = {
    url: '/item'
  }
  self.provider = new Provider(providerSet)
  var graphViewSet = {
    container: self.elements.container,
    selection: self.selection,
    width: 1000,
    height: 1000,
  }
  var listViewSet = {
    container: self.elements.container,
    selection: self.selection,
    width: 1000,
    height: 1000,
  }

  self.selection.on('add', self._onSelect.bind(self))
  self.search = new Search({container: self.elements.panel})
  self.search.on('update', self._onSearch.bind(self))

  self.listView = new ListView(listViewSet)
  self.graphView = new GraphView(graphViewSet)

  self.itemman.on('change', self._onItemsChange.bind(self))
}

Self.prototype._onSelect = function (selection) {
  var self = this
  //TODO multiple selected
  self.provider.request('getGraph', selection[0], 1)
    .then(function (graph) {
      self.itemman.add(graph)
    })
}

Self.prototype._onSearch = function (data) {
  var self = this
  self.provider.request('findGraph', data.str, data.flags)
    .then(function (graph) {
      self.itemman.add(graph)
    })
}

Self.prototype._onItemsChange = function (vGraph) {
  var self = this
  self.graphView.render(vGraph)
  self.listView.render(vGraph)
}

var templates = G.Templates
G = new Self
G.Templates = templates
