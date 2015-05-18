var Handlebars = require('handlebars')

var Self = function () {
  var self = Handlebars
  self.registerHelper('picture', require('../helpers/picture'))
  self.registerHelper('youtube', require('../helpers/youtube'))
  self.registerHelper('format_date', require('../helpers/date'))
  self.registerHelper('fbEvent', require('../helpers/fbEvent'))

  self.registerPartial('search', '')
  self.registerPartial('keywords', '')
  self.registerPartial('menu', '')
  return self
}

module.exports = Self
