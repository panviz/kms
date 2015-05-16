var fs = require('fs')
var path = require('path')
var yaml = require('js-yaml')
var wrench = require('wrench')
var _ = require('lodash')

var Page = require('./Page')

var Self = function () {
  var self = this
  var root_path = process.cwd()

  var config = yaml.load(fs.readFileSync(root_path + '/_config.yml'))
  self.ctx = {
    config: config
  , layouts: {}
  }
  self.pages = []

  self.readLayouts()

  self.content = ['team'] //read all folders inside
  self.content.forEach(function (section) {
    self.readContents(section)
  })
}

Self.prototype.readContents = function (section) {
  var self = this

  var folderPath = path.join(self.ctx.config.content_dir, section)
  var files = wrench.readdirSyncRecursive(folderPath)
  var pages = _.map(files, function (filename) {
    var s = fs.readFileSync(path.join(folderPath, filename), 'utf8')
    if (!s) return
    var page = new Page(self.ctx, self.parse(s))
    self.pages.push(page)
    return page
  })
  self.content[section] = pages
}

Self.prototype.readLayouts = function () {
  var self = this

  var filename = 'team'
  var s = fs.readFileSync(path.join('layout', filename + '.html'), 'utf8')
  var parsed = self.parse(s)
  //TODO layout may be a partial
  self.ctx.layouts[filename] = parsed.content
}

Self.prototype.parse = function (s) {
  var self = this
  , data = s.split('---')
  , parsed = yaml.load(data[1], 'utf8')
  parsed.content = data[2]

  return parsed
}

module.exports = Self
