var fs =  require('fs')
, glob = require('glob')
, Path = require('path')
, _ = require('lodash')
, yaml = require('js-yaml')
, Handlebars = require('handlebars')

var Self = function () {
  var self = this

  self.readLayout()
  self.engine = Handlebars
  self.compile = self.engine.compile
  self.registerHelpers()
  self.registerPartials()
}

Self.prototype.readLayout = function () {
  var self = this

  var files = glob.sync('layout/*.html')
  _.each(files, function (filename) {
    var name = Path.basename(filename, Path.extname(filename))
    var s = fs.readFileSync(filename, 'utf8')
    var layout = self.parse(s)
    if (layout.content) {
      layout.template = self.compile(layout.content)
      layout.name = name
      DB.setLayout(name, layout)
    }
  })
}

Self.prototype.registerHelpers = function () {
  var self = this

  glob.sync('/src/helper/**/*.js').forEach(function (path) {
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

Self.prototype.render = function (page) {
  var self = this
  , layout = DB.getLayout(page.layout)
  , content

  if (!layout) throw ('Layout "' + page.layout + '" is not present')

  if (page.content)
    content = self.engine.compile(page.content)(page)

  page.html = layout.template({
    page: page
  , content: content
  })
    
  var parentLayout = DB.getLayout(layout.layout)
  if (parentLayout) {
    page.html = parentLayout.template({page: page, content: page.html})
  }
}

module.exports = Self
