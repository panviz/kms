/*
 * Raw provider
 * Items consistent FS-based storage
 */
var fs = require('fs')
, Path = require('path')
, glob = require('glob')
, isbinaryfile = require('isbinaryfile')
, _ = require('lodash')
, Graph = require('../graph/index')

var Self = function () {}

/**
 * reads from a directory with files named by their Keys
 * @param String source folder name
 * @return Graph
 */
Self.prototype.read = function (source) {
  var self = this
  return new Promise(function (resolve, reject) {
    var graph = new Graph
    var counter = 0
    var files = glob.sync('*', {cwd: source})
    _.each(files, function (key) {
      var path = Path.join(source, key)
      var linksString = ''

      if (isbinaryfile.sync(path)) {
        var readStream = fs.createReadStream(path, {encoding: 'utf8'})
        readStream.on('data', function (chunk) {
          var endLinksPosition = chunk.indexOf(']')
          if (endLinksPosition > 0) {
            linksString += chunk.slice(0, endLinksPosition + 1)
            readStream.close()
            _onFileRead(key, linksString)
          } else linksString += chunk
        })
      } else {
        var str = fs.readFileSync(path, 'utf8')
        var endLinksPosition = str.indexOf(']') + 1
        linksString += str.slice(0, endLinksPosition)
        //exclude '\n'
        _onFileRead(key, linksString, str.slice(endLinksPosition + 1))
      }
    })
    function _onFileRead(key, linksString, value) {
      var linked = JSON.parse(linksString)
      graph.set(value, key)
      graph.associateGroup(key, linked)
      if (++counter === files.length) resolve(graph)
    }
  })
}

Self.prototype.get = function (key, p) {
  var self = this
  return new Promise(function (resolve, reject) {
    fs.readFile(p.source, function (data) {
      resolve(data)
    })
  })
}

/**
 * Writes items in one folder with IDs as filenames
 * Start of file contains utf8 encoded string of links Array []
 * @param Graph graph
 */
Self.prototype.write = function (graph, p) {
  var self = this
  if (!p.target) return console.log("no path specified to write a file")
  _.each(graph.getItemsMap(), function (value, key) {
    var path = Path.join(p.target, key)
    var str = value == undefined ? '' : value
    str = JSON.stringify(graph.getLinked(key)) + '\n' + str
    try {
    fs.writeFileSync(path, str)
    } catch(e) {console.log(e)}
  })

  console.log(_.keys(graph.getItemsMap()).length + ' Items written')
}

module.exports = new Self
