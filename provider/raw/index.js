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
Self.linksDelimiter = '\n'

/**
 * Reads from a directory with files named by their Keys
 * @param String source folder name
 * @return Graph
 */
Self.prototype.read = function (source) {
  var self = this
  var obj = {items: {}, links: {}}
  return new Promise(function (resolve, reject) {
    var counter = 0
    var files = glob.sync('*', {cwd: source})
    _.each(files, function (key) {
      var path = Path.join(source, key)
      self._getFile(path)
        .then(function (data) {
          var links = JSON.parse(data.linksString)
          obj.items[key] = data.value
          obj.links[key] = links
          if (++counter === files.length) resolve(new Graph(obj))
        })
    })
  })
}
/**
 * Retrieve item
 */
Self.prototype.get = function (key, p) {
  var self = this
  var graph = new Graph
  var path = Path.join(p.source, key)
  return new Promise(function (resolve, reject) {
    self._getFile(path, {getBinary: true})
      .then(function (data) {
        resolve(data.value)
      })
  })
}
/**
 * TODO return binary data on getBinary flag
 */
Self.prototype._getFile = function (path, p) {
  var self = this
  p = p || {}
  var linksString = ''
  var value

  return new Promise(function (resolve, reject) {
    if (isbinaryfile.sync(path)) {
      var readStream = fs.createReadStream(path, {encoding: 'utf8'})
      readStream.on('data', function (chunk) {
        var endLinksPosition = chunk.indexOf(Self.linksDelimiter)
        if (endLinksPosition > 0) {
          linksString += chunk.slice(0, endLinksPosition + 1)
          if (p.getBinary) {}
          readStream.close()
          resolve({linksString: linksString})
        } else linksString += chunk
      })
    } else {
      fs.readFile(path, 'utf8', function (err, str) {
        var endLinksPosition = str.indexOf(Self.linksDelimiter)
        linksString += str.slice(0, endLinksPosition)
        value = str.slice(endLinksPosition + 1)
        resolve({linksString: linksString, value: value})
      })
    }
  })
}
/**
 * Save item
 */
Self.prototype.set = function (key, value, links, p) {
  var self = this
  var content = value === undefined ? '' : value
  content = JSON.stringify(links) + Self.linksDelimiter + content
  try {
    fs.writeFileSync(Path.join(p.target, key), content)
  } catch(e) {console.log(e)}
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
    var links = graph.getLinks(key)
    self.set(key, value, links, p)
  })

  console.log(_.keys(graph.getItemsMap()).length + ' Items written')
}

module.exports = new Self
