#!/usr/bin/env node
//Command line interface to Graphiy.CMS'

var argv = require('minimist')(process.argv.slice(2))
, _ = require('lodash')
, app = new require('./app')

if (!argv._[0] || argv._[0] === 'server') {
  require('../server/index.js')
} else 
//./graphiy convert path-to-source path-to-target --source="module-name" --target="module-name"
var defaults = {root: 'root'}

//TODO where to put 'convert' configs?
_.extend(defaults, {
  ignore: ['index']
, noTextParsing: true
})

if (argv._[0] === 'convert') {
  var path = {
    source: argv._[1],
    target: argv._[2],
  }
  var provider = {
    source: argv.source,
    target: argv.target,
  }
  app.convert(path, provider)
}
