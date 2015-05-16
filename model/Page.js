var moment = require('moment')
var _ = require('lodash')
var Handlebars = require('handlebars')

var Self = function (ctx, source) {
  var self = this

  _.extend(self, source)

  self.date = moment(source.date, ctx.config.date_format)
  if (self.content) {
    var contentSplit = self.content.split(ctx.config.excerpt_separator)
    self.excerpt = source.excerpt || (contentSplit.length > 1 ? contentSplit[0] : undefined)
  }

  var layout = ctx.layouts[source.layout]
  if (!layout) throw ('Layout "' + source.layout + '" is not present')

  Handlebars.registerHelper('picture', function(path) {
    return '<img src="/image/' + path + '"/>'
  });

  var template = Handlebars.compile(layout);

  self.html = template({page: self})
  console.log(self.html)
}

module.exports = Self
