/*
 * Webpage Item type
 */
var _ = require('lodash')
, config = require('../config')

var Self = function (data) {
  var self = this
}

Self.prototype.set = function (data) {
  var self = this
  , layout = Storage.get(data.layout)
  , content

  if (self.excerpt) {
    self.content.replace('<!--more-->', '<a class="anchor" id="read-more"></a>')
  }

  if (!layout) throw ('Layout "' + data.layout + '" is not present')

  if (data.content)
    content = Handlebars.compile(data.content)(data)

  data.html = layout.template({
    page: page
  , content: content
  })
    
  var parentLayout = DB.getLayout(layout.layout)
  if (parentLayout) {
    data.html = parentLayout.template({page: page, content: page.html})
  }
}


module.exports = Self
