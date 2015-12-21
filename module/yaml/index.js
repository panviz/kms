var fs = require('fs')
, Path = require('path')
, glob = require('glob')
, _ = require('lodash')
, yaml = require('js-yaml')
, Storage = require('../associative/index')

var Self = function (p) {
  this.p = p || {}
  this.storage = new Storage()
}

Self.prototype.read = function () {
  var self = this

  var files = glob.sync(Path.join(self.p.source, 'data/*'))
  _.each(files, function (filename) {
    var name = Path.basename(filename, Path.extname(filename))
    var s = fs.readFileSync(filename, 'utf8')
    var data = yaml.load(s, 'utf8')
    self.storage.set(data)
  })
}
//TODO add sorting items by length before dumping
//this will output long item less times
Self.prototype.write = function (storage) {
  var self = this
  if (!self.p.target) throw("Don't know where to write")
  if (!self.p.target.match('yml')) self.p.target = Path.join(self.p.target, 'data.yml')
  if (storage) this.storage = storage
  var items = {}

  self.storage.getLinksArray().forEach(function (link) {
    var item1 = self.storage.get(link[0])
    var item2 = self.storage.get(link[1])

    if (_.isArray(item1)) item1 = self._getGroupValue(item1)
    if (_.isArray(item2)) item2 = self._getGroupValue(item2)

    if (!_.isArray(items[item1])) items[item1] = []
    items[item1].push(item2)
  })
  console.log(_.keys(self.storage.items()).length + ' Items written')
  var yml = yaml.dump(items)
  fs.writeFileSync(self.p.target, yml)
}

Self.prototype._getGroupValue = function (group) {
  var self = this
  var childNames = _.map(group, function (key) {
    var value = self.storage.get(key)
    return _.isArray(value) ? self._getGroupValue(value) : value
  })
  return childNames.join('.')
}

module.exports = Self
