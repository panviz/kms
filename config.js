var fs = require('fs')
var yaml = require('js-yaml')

var root_path = process.cwd()
module.exports = yaml.load(fs.readFileSync(root_path + '/_config.yml'))
