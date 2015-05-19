var _ = require('lodash')
, yaml = require('js-yaml')

var Self = function () {
}

Self.prototype.parse = function (s) {
  var self = this
  , data = s.split('---')
  
  if (!s.match('---')) return {content: s}

  var parsed = yaml.load(data[1], 'utf8')
  parsed.content = data[2]

  return parsed
}

module.exports = Self
