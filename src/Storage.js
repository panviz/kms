var fs = require('fs')
, Path = require('path')
, glob = require('glob')
, _ = require('lodash')
, Tagman = require('./model/Tagman')

var Self = function (renderer) {
  var self = this
  self._data = {}
  self._layouts = {}
  self._pages = []
}

Self.prototype.setData = function (name, data) {
  var self = this
  if (name === 'tag') Tagman.set(data)
    else self._data[name] = data
}

Self.prototype.getData = function (name) {
  var self = this
  return self._data[name]
}

Self.prototype.setLayout = function (name, layout) {
  var self = this
  self._layouts[name] = layout
}

Self.prototype.getLayout = function (name) {
  var self = this
  return self._layouts[name]
}

Self.prototype.setPage = function (page) {
  var self = this
  if (!page) return
  Tagman.set(page.tags)
  self._pages.push(page)
}

Self.prototype.getPages = function () {
  var self = this
  return self._pages
}

module.exports = new Self
