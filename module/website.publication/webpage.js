/*
 * Webpage Item type
 */
var _ = require('lodash')
, db = require('../../core/db')

var Self = function (data) {
}
/**
 * @param pageKey Key of Item representing page to be transformed into Webpage
 * @return String content of webpage
 */
Self.prototype.set = function (pageKey) {
  var self = this
  , layout = self._findLayout(pageKey)
  , content = db.get(key)

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
  return html
}
//Find layout item as linked with ['itemtype', 'layout'] and ['name', layoutName]
Self.prototype._findLayout = function (pageKey) {
  //find name of layout
  var layoutName
  var layoutITK = db.findGroup(['itemtype', 'layout'])
  var layoutNameGroupK = db.findGroup(['name', layoutName])
  var layout = db.findByKeys([layoutITK, layoutNameGroupK])

  return layout
}

module.exports = new Self
