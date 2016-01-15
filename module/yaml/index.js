/**
 * YAML provider - synchronous
 * Reads from string
 */
var fs = require('fs')
, Path = require('path')
, glob = require('glob')
, _ = require('lodash')
, yaml = require('js-yaml')
, inflection = require('inflection')
, db = require('../../core/db')

var Self = function (p) {
  this.p = p || {}
}
/**
 * parse yaml key-value as a group
 * but if value is array just link each value item to key
 * @returns Key of the group for all data
 */
Self.prototype.read = function () {
  var self = this

  var data = yaml.load(self.p.source, 'utf8')
  var item = db.set('')
  _.each(data, function (datum2, datum1) {
    if (!datum1 || !datum2) return
    var key1, key2, groupK
    key1 = db.set(datum1)

    if (!_.isArray(datum2)) {
      key2 = db.set(datum2)
      groupK = db.set()
      db.associateGroup(groupK, [key1, key2])
      db.associate(item, groupK)
    } else {
      key1 = db.set(inflection.singularize(datum1))
      datum2.forEach(function (arrayDatum) {
        key2 = db.set(arrayDatum)
        groupK = db.set()
        db.associateGroup(groupK, [key1, key2])
        db.associate(item, groupK)
      })
    }
  })
  return item
}
//TODO add sorting items by length before dumping
//this will output long item less times
Self.prototype.write = function () {
  var self = this
  if (!self.p.target) console.log("no path specified to write a file")
  else if (!self.p.target.match('yml')) self.p.target = Path.join(self.p.target, 'data.yml')
  var items = {}

  var unlinked = _.difference(_.keys(db.items()), _.keys(db.getLinksMap()))
  unlinked.forEach(function (item) {
    items[item] = db.get(item)
  })
  db.getLinksArray().forEach(function (link) {
    var item1 = db.get(link[0]) || link[0]
    var item2 = db.get(link[1]) || link[1]

    if (!_.isArray(items[item1])) items[item1] = []
    items[item1].push(item2)
  })
  console.log(_.keys(db.items()).length + ' Items to write')
  var yml = yaml.dump(items)
  if (self.p.target) fs.writeFileSync(self.p.target, yml)
  return yml
}

module.exports = Self
