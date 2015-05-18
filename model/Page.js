/*
 * Object representing a page
 */
var moment = require('moment')
var _ = require('lodash')
var Path = require('path')
var config = require('../config')

var Self = function (path, source) {
  var self = this

  _.extend(self, source)
  self.section = path.split(Path.sep)[0]
  var pattern = config.permalink[self.section] || config.permalink['default']
  //TODO parse pattern

  var sectionPath = Path.relative(self.section, path)
  self.permalink = self.permalink || sectionPath
  self.name = Path.basename(self.permalink, Path.extname(self.permalink))
  if (self.name === 'index') self.name = Path.basename(Path.dirname(self.permalink))

  self.date = moment(source.date, config.date_format).toDate()
  if (self.content) {
    var contentSplit = self.content.split(config.excerpt_separator)
    self.excerpt = source.excerpt || (contentSplit.length > 1 ? contentSplit[0] : undefined)
    self.content.replace('<!--more-->', '<a class="anchor" id="read-more"></a>')
  }
}

module.exports = Self
