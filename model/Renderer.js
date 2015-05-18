var fs =  require('fs')
, glob = require('glob')
, Path = require('path')
, Handlebars = require('handlebars')

var Self = function () {
  var self = this

  self.engine = Handlebars
  self.compile = Handlebars.compile
  self.registerHelpers()
  self.registerPartials()
}

Self.prototype.registerHelpers = function () {
  var self = this

  glob.sync('node_modules/cms/helpers/**/*.js').forEach(function (path) {
    var name = Path.basename(path, Path.extname(path))
    path = Path.relative('node_modules', path)
    self.engine.registerHelper(name, require(path))
  })
}

Self.prototype.registerPartials = function () {
  var self = this

  glob.sync('layout/partial/**/*').forEach(function (path) {
    var name = Path.basename(path, Path.extname(path))
    self.engine.registerPartial(name, fs.readFileSync(path, 'utf8'))
  })
}

module.exports = Self
