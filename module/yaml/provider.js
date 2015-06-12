var fs = require('fs')
, Path = require('path')
, glob = require('glob')
, _ = require('lodash')
, yaml = require('js-yaml')
, Storage = require('../object/provider')

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
  if (!self.p.target) return
  if (storage) this.storage = storage
  var items = {}

  self.storage.getLinks().forEach(function (link) {
    var item1 = self.storage.get(link[0])
    var item2 = self.storage.get(link[1])

    if (_.isArray(item1)) item1 = self._getGroupValue(item1)
    if (_.isArray(item2)) item2 = self._getGroupValue(item2)

    if (!_.isArray(items[item1])) items[item1] = []
    items[item1].push(item2)
  })
  var yml = yaml.dump(items)
  fs.writeFileSync(Path.join(self.p.target, 'data.yml'), yml)
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
