import _ from 'lodash'
const Util = {}

Util.findElements = function (root, selectors) {
  const elements = {}
  elements.root = root instanceof $ ? root : $(root)
  _.forEach(selectors, (selector, key) => {
    elements[key] = elements.root.find(selector)
  })
  return elements
}
/**
 * update elements reference
 */
Util.updateElements = function (control) {
  /* eslint-disable no-param-reassign */
  control.elements = Util.findElements(control.elements.root, control.selectors)
  /* eslint-enable */
}

Util.animate = function (duration, draw) {
  let start = undefined
  let id
  const tick = (timestamp) => {
    if (!start) start = timestamp
    const progress = timestamp - start
    if (progress < duration) {
      id = requestAnimationFrame(tick)
      draw(progress, duration)
    } else {
      cancelAnimationFrame(id)
    }
  }
  id = requestAnimationFrame(tick)
}

Util.pluralize = function (arg) {
  return _.isArray(arg) ? arg : [arg]
}
/**
 * @param min Integer
 * @param value Integer
 * @param max Integer
 */
Util.between = function (min, value, max) {
  let result = false
  if (min < max) {
    if (value > min && value < max) {
      result = true
    }
  }
  if (min > max) {
    if (value > max && value < min) {
      result = true
    }
  }
  if (value === min || value === max) {
    result = true
  }
  return result
}
/**
 * TODO use https://github.com/substack/point-in-polygon
 * @param point Object {x, y}
 * @param rect Object {top, left, right, bottom}
 */
Util.pointInRectangle = function (point, rect) {
  let result = false

  if (Util.between(rect.left, point.x, rect.right) &&
      Util.between(rect.top, point.y, rect.bottom)) {
    result = true
  }
  return result
}

Util.log = function (message) {
  if (typeof DEBUG !== 'undefined' && DEBUG) console.info(message)
}
/**
 * requires sequential perimeter points
 * polygon without intersections
 */
Util.centroid = function (_points) {
  const points = Util.simplifyPolygon(_points)
  let i, j, p1, p2, f, area, x, y, center // eslint-disable-line
  const length = points.length

  if (!length) { return null }
  if (length === 2) return [(points[0][0] + points[1][0]) / 2, (points[0][1] + points[1][1]) / 2]

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
Util.simplifyPolygon = function (points) {
  if (points.length < 4) return points
  var left, right, top, bottom // eslint-disable-line
  _.each(points, (point) => {
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

RegExp.prototype.toJSON = function () { return this.toString() } // eslint-disable-line

export default Util
global.$util = Util
