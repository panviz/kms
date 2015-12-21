/**
 * Reads from FileSystem to module.associative
 * layout is indicated as item linked with ['layout', 'itemtype'] and ['name', 'some_layout_name']
 * Page is indicated same way: by connections with ['page', 'itemtype']. But no name or title is required
 */
var fs = require('fs')
, Path = require('path')
, glob = require('glob')
, _ = require('lodash')
, db = require('../associative/index')
, Page = require('./page')

var Self = function (p) {
  var self = this

  if (_.isArray(_.keys(p.website))) {
    var siteConfig = p.website[p.render]
    self.p =  _.extend({}, p, _.values(p.website))
  }
  self.p.contentDir = Path.join(self.p.source, 'content')
  self.p.layoutDir = Path.join(self.p.source, 'layout')
  self.nameK = db.set('name')
  var layoutK = db.set('layout')
  var itemtypeK = db.set('itemtype')
  self.layoutITK = db.set([layoutK, itemtypeK])
  self.pageIT = new Page(p)
}

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
  //self._readImages()
  //self._readData()
  self._readLayouts()
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
Self.prototype._readLayouts = function () {
  var self = this

  var fileNames = glob.sync('*', {cwd: self.p.layoutDir})
  
  _.each(fileNames, function (filename) {
    var name = Path.basename(filename, Path.extname(filename))
    var layoutContent = fs.readFileSync((Path.join(self.p.layoutDir, filename)), 'utf8')
    var key = db.set(layoutContent)
    db.associate(key, self.layoutITK)
    var layoutNameK = db.set(name)
    var layoutNameGroupK = db.set([layoutNameK, self.nameK])
    db.associate(key, layoutNameGroupK)
  })
}

module.exports = Self
