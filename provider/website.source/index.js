/**
 * Reads from FileSystem
 * layout is indicated as item linked with ['layout', 'itemtype'] and ['name', 'some_layout_name']
 * Page is indicated in the same way: by connections with ['page', 'itemtype']. But no name or title is required
 */
var fs = require('fs')
, Path = require('path')
, glob = require('glob')
, _ = require('lodash')
, YamlProvider = require('../yaml/index')
, JsonProvider = require('../json/index')
, graph = require('../graph/index')
, Page = require('./page')

var Self = function (p) {
  var self = this

  if (_.isArray(_.keys(p.website))) {
    self.p =  _.extend({}, p, _.values(p.website))
  }
  self.p.contentDir = Path.join(self.p.source, 'content')
  self.p.layoutDir = Path.join(self.p.source, 'layout')
  self.layoutITK = db.setGroup('', ['itemtype', 'layout'])
  self.pageIT = new Page(p)
}
/**
 * Content is supposed to be in *Semantic.FS* format in /content folder
 * layouts - in files by their names in /layout folder
 */
Self.prototype.read = function () {
  var self = this

  if (self.p.exclude_dir) {
  }
  self.sections = _.map(glob.sync('*/', {cwd: self.p.contentDir}), function (path) {
    return path.replace('/', '')
  })
  self.sections = _.difference(self.sections, self.specialSections)
  _.each(self.sections, function (section) {
    self._processSection(section)
  })

  var yamlProvider = new YamlProvider()
  var jsonProvider = new JsonProvider()
  yamlProvider.write()
  fs.writeFileSync('d:/Graphiycms/view/test.json', JSON.stringify(jsonProvider.write()))
  //self._readImages()
  //self._readData()
  var layoutFilenames = glob.sync('*', {cwd: self.p.layoutDir})
  _.each(layoutFilenames, function (filename) {
    self._readLayout(filename)
  })
}
/**
 * parse dir1 as tag1; dir2 as tag2
 * parse 'index' as page; its extension
 * parse other assets here (binary, images)
 */
Self.prototype._processSection = function (section) {
  var self = this

  var folderPath = Path.join(self.p.contentDir, section)
  var fileNames = glob.sync('**/*.html', {cwd: folderPath})

  _.each(fileNames, function (filename) {
    self.pageIT.get(Path.join(folderPath, filename))
  })
}
/*
 * This provider has nothing special to do with Layout. So, just read its content here
 */
Self.prototype._readLayout = function (filename) {
  var self = this

  var name = Path.basename(filename, Path.extname(filename))
  var layoutContent = fs.readFileSync((Path.join(self.p.layoutDir, filename)), 'utf8')
  var key = db.set(layoutContent)
  db.associate(key, self.layoutITK)
  var layoutNameGroupK = db.setGroup('', [name, 'name'])
  db.associate(key, layoutNameGroupK)
}

module.exports = Self
