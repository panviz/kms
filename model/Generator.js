var fs = require('fs')
, Path = require('path')
, glob = require('glob')
, _ = require('lodash')
, yaml = require('js-yaml')
, config = require('../config')
, rimraf = require('rimraf')
, mkdirp = require('mkdirp')

var Page = require('./Page')

var Self = function (renderer) {
  var self = this
  self.renderer = renderer
  self.pages = []
  self.layouts = {}
  self.layoutTemplates = {}
  self.readLayouts()

  rimraf.sync(config.output_dir)

  self.specialSections = ['data', 'tag']
  self.sections = _.map(glob.sync('*/', {cwd: 'content'}), function (path) {
    return path.replace('/', '')
  })
  self.sections = _.difference(self.sections, self.specialSections)
  _.each(self.sections, function (section) {
    self.processSection(section)
  })
}

Self.prototype.readLayouts = function () {
  var self = this

  var files = glob.sync('*.html', {cwd: 'layout'})
  _.each(files, function (filename) {
    var name = Path.basename(filename, Path.extname(filename))
    var s = fs.readFileSync(Path.join('layout', filename), 'utf8')
    var layout = self.parse(s).content 
    if (layout) {
      self.layouts[name] = layout
      self.layoutTemplates[name] = self.renderer.compile(layout)
    }
  })
  //TODO layout may be a partial
}

Self.prototype.processSection = function (section) {
  if (!_.contains(['post', 'error'], section)) return //TODO remove
  var self = this

  var folderPath = Path.join(config.content_dir, section)
  var files = glob.sync('**/*.html', {cwd: folderPath})

  var pages = _.map(files, function (filename) {
    return self.read(Path.join(folderPath, filename))
  })

  pages = _.compact(pages)
  _.each(pages, function (page) {
    self.pages.push(page)
    self.render(page)
    self.write(page)
  })
}

Self.prototype.read = function (path) {
  var self = this

  var s = fs.readFileSync(path, 'utf8')
  if (!s) return
  var parsed = self.parse(s)
  var path = Path.relative(config.content_dir, path)
  return new Page(path, parsed, config)
}

Self.prototype.parse = function (s) {
  var self = this
  , data = s.split('---')
  
  if (!s.match('---')) return {content: s}

  var parsed = yaml.load(data[1], 'utf8')
  parsed.content = data[2]

  return parsed
}

Self.prototype.render = function (page) {
  var self = this
  var layoutTemplate = self.layoutTemplates[page.layout]
  if (!layoutTemplate) throw ('Template "' + page.layout + '" is not present')

  var content = page.content ? self.renderer.compile(page.content)(page) : undefined
  page.html = layoutTemplate({
    page: page
  , content: content
  })
}

Self.prototype.write = function (page) {
  var self = this
  //TODO do not create folder for single html
  mkdirp.sync(Path.join(config.output_dir, page.name))

  var filename = Path.join(config.output_dir, page.permalink)
  fs.writeFileSync(filename, page.html)
}

module.exports = Self
