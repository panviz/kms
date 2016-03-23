var _ = require('lodash')
var Self = {}

Self.findElements = function (root, selectors) {
  var elements = {}
  elements.root = root instanceof $ ? root : $(root)
  _.forEach(selectors, function (selector, key) {
    elements[key] = elements.root.find(selector)
  })
  return elements
}
/**
 * update elements reference
 */
Self.updateElements = function (control) {
  control.elements = Self.findElements(control.elements.root, control.selectors)
}

Self.animate = function (duration, draw) {
  var start = undefined
  function tick(timestamp) {
    if (!start) start = timestamp
    var progress = timestamp - start
    if (progress < duration) {
       id = requestAnimationFrame(tick)
       draw(progress, duration)
    } else {
      cancelAnimationFrame(id)
    }
  }
  var id = requestAnimationFrame(tick)
}

Self.pluralize = function (arg) {
  return _.isArray(arg) ? arg : [arg]
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
 * TODO use https://github.com/substack/point-in-polygon
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

Self.log = function (message) {
  if (typeof DEBUG !== 'undefined' && DEBUG) console.log(message)
}
/**
 * requires sequential perimeter points
 * polygon without intersections
 */
Self.centroid = function (points) {
  points = Self.simplifyPolygon(points)
  var i, j, p1, p2, f, area, x, y, center,
    length = points.length

  if (!length) { return null }
  if (length === 2) return [(points[0][0] + points[1][0])/2, (points[0][1] + points[1][1]) / 2]

  area = x = y = 0

  for (i = 0, j = length - 1; i < length; j = i++) {
    p1 = points[i]
    p2 = points[j]

    f = p1[1] * p2[0] - p2[1] * p1[0]
    x += (p1[0] + p2[0]) * f
    y += (p1[1] + p2[1]) * f
    area += f * 3
  }

  if (area === 0) {

    // Polygon is so small that all points are on same pixel.
    center = points[0]
  } else {
    center = [x / area, y / area]
  }
  return center
}
/**
 * get circumscribing quadrilateral
 */
Self.simplifyPolygon = function (points) {
  if (points.length < 4) return points
  var left, right, top, bottom
  _.each(points, function (point) {
    if (!left) {
      left = point
      right = point
      top = point
      bottom = point
    }
    if (point[0] < left[0]) left = point
    if (point[0] > right[0]) right = point
    if (point[1] < top[1]) top = point
    if (point[1] > bottom[1]) bottom = point
  })
  return [left, top, right, bottom]
}

RegExp.prototype.toJSON = function () { return this.toString() }

export default Self
global.$util = Self
