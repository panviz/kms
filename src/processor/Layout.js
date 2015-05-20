var fs = require('fs')
, Path = require('path')
, glob = require('glob')
, _ = require('lodash')
, yaml = require('js-yaml')
, Processor = require('../Processor')
, Renderer = require('../Renderer')
, DB = require('../Storage')

var Self = function () {
  var self = this
  self.read()
}
Self.prototype = Object.create(Processor.prototype)

Self.prototype.read = function () {
  var self = this

  var files = glob.sync('layout/*.html')
  _.each(files, function (filename) {
    var name = Path.basename(filename, Path.extname(filename))
    var s = fs.readFileSync(filename, 'utf8')
    var layout = self.parse(s)
    if (layout.content) {
      layout.template = Renderer.compile(layout.content)
      layout.name = name
      DB.setLayout(name, layout)
    }
  })
}

module.exports = new Self
