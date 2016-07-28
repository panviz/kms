$.fn.cssInt = function (prop, value) {
  if (value !== undefined) this.css(prop, `${value}px`)
  return _.toNumber(this.css(prop)) || 0
}
$.fn.translateX = function (x) {
  const matrix = this.transform()
  const newX = _.isNumber(x) ? x : matrix[4]
  const newY = matrix[5]
  const newScale = matrix[0]
  if (x === undefined) return newX
  this.transform(newX, newY, newScale)
}

$.fn.translateY = function (y) {
  const matrix = this.transform()
  const newX = matrix[4]
  const newY = _.isNumber(y) ? y : matrix[5]
  const newScale = matrix[0]
  if (y === undefined) return newY
  this.transform(newX, newY, newScale)
}

$.fn.translate = function (x, y) {
  const matrix = this.transform()
  const newX = _.isNumber(x) ? x : matrix[4]
  const newY = _.isNumber(y) ? y : matrix[5]
  const newScale = matrix[0]
  if (y === undefined && y === undefined) return [newX, newY]
  this.transform(newX, newY, newScale)
}

$.fn.scale = function (scale) {
  const matrix = this.transform()
  const newX = matrix[4]
  const newY = matrix[5]
  const newScale = scale || matrix[0]
  if (scale === undefined) return newScale
  this.transform(newX, newY, newScale)
}

$.fn.transform = function (_x, _y, _scale, ...args) {
  let transform = this.css('transform')
  if (transform === 'none') transform = 'matrix(1,0,0,1,0,0)'
  let matrix = transform.slice(7, -1).split(',')
  const x = _.isNumber(_x) ? _x : _.toNumber(matrix[4])
  const y = _.isNumber(_y) ? _y : _.toNumber(matrix[5])
  const scale = _scale || _.toNumber(matrix[0])
  matrix = [scale, 0, 0, scale, x, y]

  if (_.isEmpty(arguments)) return matrix

  this.css('transform', `matrix(${matrix.join(',')})`)
}

$.getStyle = function (selector) {
  const classes = document.styleSheets[0].rules || document.styleSheets[0].cssRules
  for (let x = 0; x < classes.length; x++) {
    if (classes[x].selectorText === selector) {
      return classes[x].cssText ? classes[x].cssText : classes[x].style.cssText
    }
  }
}
