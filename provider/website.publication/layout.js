/*
 * Handlebars layout Item type
 */
var Handlebars = require('handlebars')
, Storage = require('../associative/index')

var Self = function () {
}

Self.prototype.get = function (data) {
  var self = this

  data.template = Handlebars.compile(layout)
}

module.exports = Self
