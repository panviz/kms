var app = {}
, dataProcessor = require('./src/processor/Data')
, layoutProcessor = require('./src/processor/Layout')
, pageProcessor = require('./src/processor/Page')
, Generator = require('./src/generator/Page')
, Renderer = require('./src/Renderer')
, DB = require('./src/Storage')

DB.getPages().forEach(function (page) {
  Renderer.render(page)
  Generator.write(page)
})
