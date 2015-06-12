/**
 * Converts special structure from FileSystem to static website
 */
var fs = require('fs')
, Path = require('path')
, glob = require('glob')
, _ = require('lodash')
, Storage = require('../object/provider')

var Self = function (p) {
  if (_.isArray(_.keys(p.website)) && p.render) {
    var siteConfig = p.website[p.render]
    this.p =  _.extend({}, p, _.values(p.website))
  }
}

Self.prototype.read = function () {
  var self = this

  if (self.p.exclude_dir) {
  }
  self.sections = _.map(glob.sync('*/', {cwd: 'content'}), function (path) {
    return path.replace('/', '')
  })
  self.sections = _.difference(self.sections, self.specialSections)
  _.each(self.sections, function (section) {
    self.processSection(section)
  })
}

Self.prototype.processSection = function (section) {
  var self = this

  var folderPath = Path.join(self.p.content_dir, section)
  var files = glob.sync('**/*.html', {cwd: folderPath})

  _.each(files, function (filename) {
    var page = self.read(Path.join(folderPath, filename))
    DB.setPage(page)
  })
}

Self.prototype.readPage = function (path) {
  var s = fs.readFileSync(path, 'utf8')
  if (!s) return

  var self = this
  , data = s.split('---')
  
  if (!s.match('---')) return {content: s}

  var parsed = yaml.load(data[1], 'utf8')
  parsed.content = data[2]

  return parsed
}

Self.prototype.readPage = function (path) {
  var self = this

  var parsed = pageProcessor(path)
  var path = Path.relative(self.p.content_dir, path)
  return new Page(path, parsed, config)
}

module.exports = Self
