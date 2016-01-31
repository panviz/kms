/*
 * Raw provider
 * Items consistent FS-based storage
 */
var fs = require('fs')
, Path = require('path')
, glob = require('glob')
, _ = require('lodash')
, Graph = require('../graph/index')

var Self = function (p) {
  this.p = p || {}
}
/**
 * reads from a directory with files named by their Keys
 * @param String source folder name
 * @return Graph
 */
Self.prototype.read = function (source) {
  var graph = new Graph
  var linksMap = {}
  self.files = _.map(glob.sync('*', {cwd: self.p.source}), function (key) {
    var str = fs.readFileSync(Path.join(self.p.source, key), 'utf8')
    var data = str.split('---')
    linksMap[key] = JSON.parse(data[1])
    graph.set(data[2], key)
  })
  _.each(linksMap, function (linked, key) {
    graph.associateGroup(key, linked)
  })
  return new Promise(function (resolve, reject) {
    resolve(graph)
  })
}
/**
 * Writes items in one folder with IDs as filenames
 * Start of file contains utf8 encoded string of links Array []
 * @param Graph graph
 */
Self.prototype.write = function (graph, target) {
  var self = this
  if (!self.p.target) return console.log("no path specified to write a file")
  _.each(graph.getItemsMap(), function (value, key) {
    var path = Path.join(self.p.target, key)
    var str = value == undefined ? '' : value
    str = '---\n' + JSON.stringify(graph.linked(key)) + '\n---\n' + str
    try {
    fs.writeFileSync(path, str)
    } catch(e) {console.log(e)}
  })

  console.log(_.keys(graph.getItemsMap()).length + ' Items written')
}

module.exports = Self
