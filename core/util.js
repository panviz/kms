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
// update elements reference
Self.updateElements = function (control) {
  control.elements = Self.findElements(control.elements.root, control.selectors)
}
/**
 * @param min Integer
 * @param value Integer
 * @param max Integer
 */
Self.between = function (min, value, max) {
  var result = false
  if ( min < max ) {
    if ( value > min && value < max ) {
      result = true
    }
  }
  if ( min > max ) {
    if ( value > max && value < min) {
      result = true
    }
  }
  if ( value == min || value == max ) {
    result = true
  }
  return result
}
/**
 * @param point Object {x, y}
 * @param rect Object {top, left, right, bottom}
 */
Self.pointInRectangle = function (point, rect) {
  var result = false

  if (Self.between(rect.left, point.x, rect.right) && Self.between(rect.top, point.y, rect.bottom)) {
    result = true
  }
  return result
}

RegExp.prototype.toJSON = function() { return this.toString() }

module.exports = Self
