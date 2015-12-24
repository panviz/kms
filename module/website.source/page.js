/*
 * Object representing a page
 */
var _ = require('lodash')
, fs = require('fs')
, yaml = require('js-yaml')
, inflection = require('inflection')
, db = require('../../core/db')

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

  var json = yaml.load(data[1], 'utf8')
  var content = data[2]

  if (content) {
    var contentSplit = content.split(self.p.excerptSeparator)
    json.excerpt = json.excerpt || (contentSplit.length > 1 ? contentSplit[0] : undefined)
  }
  self._parse(json, content)
}

Self.prototype._parse = function (yaml, content) {
  var self = this
  var pageITK = db.set(['itemtype', 'page'])
  var contentK = db.set(content)
  db.associate(contentK, pageITK)

  _.forEach(yaml, function (value, key) {
    if (!value || !key) return
    var keyK, valueK
    keyK = db.set(key)

    if (!_.isArray(value)) {
      valueK = db.set(value)
      keyValueK = db.set([keyK, valueK])
      db.associate(contentK, keyValueK)
    } else {
      keyK = db.set(inflection.singularize(key))
      value.forEach(function (v) {
        valueK = db.set(v)
        keyValueK = db.set([keyK, valueK])
        db.associate(contentK, keyValueK)
      })
    }
  })
}

module.exports = Self
