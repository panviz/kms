$.fn.cssInt = function (prop, value) {
  if (value !== undefined) this.css(prop, value + 'px')
  return _.toNumber(this.css(prop)) || 0
}
$.fn.translateX = function (x) {
  var matrix = this.transform()
  var newX = _.isNumber(x) ? x : matrix[4]
  var newY = matrix[5]
  var newScale = matrix[0]
  if (x === undefined) return newX
  this.transform(newX, newY, newScale)
}

$.fn.translateY = function (y) {
  var matrix = this.transform()
  var newX = matrix[4]
  var newY = _.isNumber(y) ? y : matrix[5]
  var newScale = matrix[0]
  if (y === undefined) return newY
  this.transform(newX, newY, newScale)
}

$.fn.translate = function (x, y) {
  var matrix = this.transform()
  var newX = _.isNumber(x) ? x : matrix[4]
  var newY = _.isNumber(y) ? y : matrix[5]
  var newScale = matrix[0]
  if (y === undefined && y === undefined) return [newX, newY]
  this.transform(newX, newY, newScale)
}

$.fn.scale = function (scale) {
  var matrix = this.transform()
  var newX = matrix[4]
  var newY = matrix[5]
  var newScale = scale || matrix[0]
  if (scale === undefined) return newScale
  this.transform(newX, newY, newScale)
}

$.fn.transform = function (x, y, scale) {
  var transform = this.css('transform')
  if (transform === 'none') transform = "matrix(1,0,0,1,0,0)"
  var matrix = transform.slice(7, -1).split(',')
  x = _.isNumber(x) ? x : _.toNumber(matrix[4])
  y = _.isNumber(y) ? y : _.toNumber(matrix[5])
  scale = scale || _.toNumber(matrix[0])
  matrix = [scale, 0, 0, scale, x, y]

  if (_.isEmpty(arguments)) return matrix

  this.css('transform', 'matrix('+ matrix.join(',') +')')
}

$.getStyle = function (selector) {
  var classes = document.styleSheets[0].rules || document.styleSheets[0].cssRules
  for (var x = 0; x < classes.length; x++) {
    if (classes[x].selectorText == selector) {
      return classes[x].cssText ? classes[x].cssText : classes[x].style.cssText
    }
  }
}
