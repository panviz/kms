/*
 * Writes html to website deployment
 */
var _ = require('lodash')
, fs =  require('fs')
, glob = require('glob')
, Path = require('path')
, Handlebars = require('handlebars')
, Webpage = require('./webpage')
, db = require('../../core/db')

var Self = function () {
  var self = this

  self.engine = Handlebars
  self.compile = self.engine.compile
  self._registerItemtypes()
}
/*
 * Register module's and content's itemtypes
 */
Self.prototype._registerItemtypes = function () {
  var self = this

  //Handlebars helpers
  glob.sync('/module/website.publication/hhelper/**/*.js').forEach(function (path) {
    var name = Path.basename(path, Path.extname(path))
    path = Path.relative('node_modules', path)
    self.engine.registerHelper(name, require(path))
  })
  //Handlebars compatible partials
  glob.sync('layout/partial/**/*').forEach(function (path) {
    var name = Path.basename(path, Path.extname(path))
    self.engine.registerPartial(name, fs.readFileSync(path, 'utf8'))
  })
}
/**
 * Find all linked to ['itemtype', 'page'];
 * set with Webpage itemtype
 */
Self.prototype.write = function () {
  var pageITK = db.findGroup(['itemtype', 'page'])
  var pagesK = db.groupLinked(pageITK)
  _.each(pagesK, function (key) {
    var webpage = Webpage.set(key)
  })
}

module.exports = Self
