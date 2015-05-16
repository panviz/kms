var fs = require('fs')
var yaml = require('js-yaml')
var Generator = require('./model/Generator')
var Renderer = require('./model/Renderer')

var app = {}
var root_path = process.cwd()
app.config = yaml.load(fs.readFileSync(root_path + '/_config.yml'))

app.r = new Renderer()
app.g = new Generator(app.config, app.r)

module.exports = app
