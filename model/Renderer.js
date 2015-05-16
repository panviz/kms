var Handlebars = require('handlebars')

var Self = function () {
  var self = Handlebars
  self.registerHelper('picture', require('../helpers/picture'))
  self.registerHelper('youtube', require('../helpers/youtube'))
  self.registerHelper('format_date', require('../helpers/date'))
  return self
}

module.exports = Self
