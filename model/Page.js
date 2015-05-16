/*
 * Object representing a page
 */
var moment = require('moment')
var _ = require('lodash')

var Self = function (source, config) {
  var self = this

  _.extend(self, source)

  self.date = moment(source.date, config.date_format).toDate()
  if (self.content) {
    var contentSplit = self.content.split(config.excerpt_separator)
    self.excerpt = source.excerpt || (contentSplit.length > 1 ? contentSplit[0] : undefined)
  }
}

module.exports = Self
