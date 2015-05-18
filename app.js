var fs = require('fs')
var yaml = require('js-yaml')

var app = {}

var Generator = require('./model/Generator')
var Renderer = require('./model/Renderer')

app.r = new Renderer()
app.g = new Generator(app.r)
