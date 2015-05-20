/*
 * Object representing a page
 */
var moment = require('moment')
, _ = require('lodash')
, Plusjs = require('plusjs')
, Path = require('path')
, config = require('../config')
, Tagman = require('./Tagman')

var Self = function (path, source) {
  var self = this
  _.extend(self, source)
  self.id = Plusjs.Util.GUID()

  self.tags = self.tags || []
  var section = path.split(Path.sep)[0]
  if (Tagman.get(section) || section === 'error') self.tags.unshift(section)
  if (section === 'tag') self.permalink = '/'
  var pattern = config.permalink[section] || config.permalink['default']
  //TODO parse pattern

  if (self.permalink) {
    self.name = Path.basename(self.permalink, Path.extname(self.permalink))
  } else {
    //base name without extension
    self.name = Path.basename(path, Path.extname(path))
    //base dir name
    if (self.name === 'index') self.name = Path.basename(Path.dirname(path))
    self.permalink = Path.join(self.tags[0] || '', self.name)
  }

  self.date = moment(source.date, config.date_format).toDate()

  if (self.content) {
    var contentSplit = self.content.split(config.excerpt_separator)
    self.excerpt = source.excerpt || (contentSplit.length > 1 ? contentSplit[0] : undefined)
    self.content.replace('<!--more-->', '<a class="anchor" id="read-more"></a>')
  }
}

module.exports = Self
