/*
 * Writes html to website deployment
 */
var fs =  require('fs')
, glob = require('glob')
, Path = require('path')
, _ = require('lodash')
, Handlebars = require('handlebars')
, Layout = require('./layout')

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

module.exports = Self
