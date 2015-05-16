var fs = require('fs')
var path = require('path')
var wrench = require('wrench')
var _ = require('lodash')
var yaml = require('js-yaml')

var Page = require('./Page')

var Self = function (config, renderer) {
  var self = this
  self.config = config
  self.renderer = renderer
  self.pages = []
  self.layouts = {}
  self.readLayouts()

  self.sections = ['team'] //TODO read all folders inside
  self.content = _.map(self.sections, function (section) {
    self.processSection(section)
  })
}

Self.prototype.readLayouts = function () {
  var self = this

  var filename = 'team'
  var s = fs.readFileSync(path.join('layout', filename + '.html'), 'utf8')
  var parsed = self.parse(s)
  //TODO layout may be a partial
  self.layouts[filename] = parsed.content
}

Self.prototype.processSection = function (section) {
  var self = this

  var folderPath = path.join(self.config.content_dir, section)
  var files = wrench.readdirSyncRecursive(folderPath)

  var pages = _.map(files, function (filename) {
    return self.read(path.join(folderPath, filename))
  })

  pages = _.compact(pages)
  _.each(pages, function (page) {
    self.render(page)
    self.write(page)
  })
}

Self.prototype.read = function (path) {
  var self = this

  var s = fs.readFileSync(path, 'utf8')
  if (!s) return
  var parsed = self.parse(s)
  parsed.permalink = path
  return new Page(parsed, self.config)
}

Self.prototype.parse = function (s) {
  var self = this
  , data = s.split('---')
  , parsed = yaml.load(data[1], 'utf8')
  parsed.content = data[2]

  return parsed
}

Self.prototype.render = function (page) {
  var self = this
  var layout = self.layouts[page.layout]
  if (!layout) throw ('Layout "' + source.layout + '" is not present')

  //TODO should compile once?
  var template = self.renderer.compile(layout)

  page.html = template({page: page})
}

Self.prototype.write = function (page) {
  var self = this

  var filename = path.join(self.config.output_dir, page.permalink)
  console.log(page.html);
  //fs.writeFileSync(filename, page.html)
}

module.exports = Self
