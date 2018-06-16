import { each, isArray } from 'lodash'

export function findElements (root, selectors) {
  const elements = {}
  elements.root = root instanceof $ ? root : $(root)
  each(selectors, (selector, key) => {
    elements[key] = elements.root.find(selector)
  })
  return elements
}
/**
 * update elements reference
 */
export function updateElements (control) {
  /* eslint-disable no-param-reassign */
  control.elements = findElements(control.elements.root, control.selectors)
  /* eslint-enable */
}

export function animate (duration, draw) {
  let start
  let id
  const tick = (timestamp) => {
    if (!start) start = timestamp
    const progress = timestamp - start
    if (progress < duration) {
      id = window.requestAnimationFrame(tick)
      draw(progress, duration)
    } else {
      window.cancelAnimationFrame(id)
    }
  }
  id = window.requestAnimationFrame(tick)
}

export function pluralize (arg) {
  return isArray(arg) ? arg : [arg]
}
/**
 * @param min Integer
 * @param value Integer
 * @param max Integer
 */
export function between (min, value, max) {
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
export function pointInRectangle (point, rect) {
  let result = false

  if (between(rect.left, point.x, rect.right) &&
      between(rect.top, point.y, rect.bottom)) {
    result = true
  }
  return result
}

export function log (message) {
  // eslint-disable-next-line
  if (typeof DEBUG !== 'undefined' && DEBUG) console.info(message)
}
/**
 * get circumscribing quadrilateral
 */
export function simplifyPolygon (points) {
  if (points.length < 4) return points
  var left, right, top, bottom // eslint-disable-line
  each(points, (point) => {
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
/**
 * requires sequential perimeter points
 * polygon without intersections
 */
export function centroid (_points) {
  const points = simplifyPolygon(_points)
  let i, j, p1, p2, f, area, x, y, center // eslint-disable-line
  const length = points.length

  if (!length) { return null }
  if (length === 2) return [(points[0][0] + points[1][0]) / 2, (points[0][1] + points[1][1]) / 2]

  // eslint-disable-next-line
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

export function getRelativeOffset (e, ancestor) {
  const target = e.target
  let x = e.offsetX
  let y = e.offsetY

  function getOffset (element) {
    if (element === ancestor) return


    if (element.style.transform) {
      const matrix = $(element).transform()
      x += matrix[4]
      y += matrix[5]
    } else {
      x += element.offsetLeft
      y += element.offsetTop
    }

    getOffset(element.parentNode)
  }
  getOffset(target)
  return { x, y }
}
export function getPosition (transform) {
  const matrix = transform.slice(transform.indexOf('(') + 1, transform.indexOf(')')).split(',')
  return { x: +matrix[matrix.length - 2], y: +matrix[matrix.length - 1] }
}
// eslint-disable-next-line
RegExp.prototype.toJSON = function () { return this.toString() }
