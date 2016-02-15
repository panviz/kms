var Self = {}
var _ = require('lodash')

Self.findElements = function (root, selectors) {
  var elements = {}
  elements.root = root instanceof $ ? root : $(root)
  _.forEach(selectors, function (selector, key) {
    elements[key] = elements.root.find(selector)
  })
  return elements
}

Self.pluralize = function(arg) {
  return _.isArray(arg) ? arg : [arg]
}

RegExp.prototype.toJSON = function() { return this.toString() }

module.exports = Self
