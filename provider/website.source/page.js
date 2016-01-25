/*
 * Object representing a page
 */
var _ = require('lodash')
, fs = require('fs')
, YamlProvider = require('../yaml/index')
, Graph = require('../graph/index')

var Self = function (p) {
  var self = this
  self.p = p
}

Self.prototype.get = function (path) {
  var self = this
  var s = fs.readFileSync(path, 'utf8')
  if (!s) return

  var data = s.split('---')
  if (!s.match('---')) throw 'page should have a title at least' 
  var content = data[2]

  var pageITK = db.findByValues(['itemtype', 'page'])[0] || db.setGroup('', ['itemtype', 'page'])
  var yamlProvider = new YamlProvider({source: data[1], target: 'd:/test/test1.yml'})
  var itemKey = yamlProvider.read()
  //if (content) {
    //var contentSplit = content.split(self.p.excerptSeparator)
    //json.excerpt = json.excerpt || (contentSplit.length > 1 ? contentSplit[0] : undefined)
  //}
  db.set(content, itemKey)
  db.associate(itemKey, pageITK)
}

module.exports = Self
