var fs = require('fs')
, Path = require('path')
, glob = require('glob')
, _ = require('lodash')
, yaml = require('js-yaml')
, db = require('../../core/db')

var Self = function (p) {
  this.p = p || {}
}

Self.prototype.read = function () {
  var self = this

  var files = glob.sync(Path.join(self.p.source, 'data/*'))
  _.each(files, function (filename) {
    var name = Path.basename(filename, Path.extname(filename))
    var s = fs.readFileSync(filename, 'utf8')
    var data = yaml.load(s, 'utf8')
    db.set(data)
  })
}
//TODO add sorting items by length before dumping
//this will output long item less times
Self.prototype.write = function () {
  var self = this
  if (!self.p.target) throw("Don't know where to write")
  if (!self.p.target.match('yml')) self.p.target = Path.join(self.p.target, 'data.yml')
  var items = {}

  db.getLinksArray().forEach(function (link) {
    var item1 = db.get(link[0]) || link[0]
    var item2 = db.get(link[1]) || link[1]

    if (!_.isArray(items[item1])) items[item1] = []
    items[item1].push(item2)
  })
  console.log(_.keys(db.items()).length + ' Items written')
  var yml = yaml.dump(items)
  fs.writeFileSync(self.p.target, yml)
}

module.exports = Self
