var _ = require('lodash')
, fs = require('fs-extra')
, Path = require('path')
, yaml = require('js-yaml')

var CLI = function () {
  var self = this
  //Switch global initialization off
  //Use command line interface for convertion
  //self.config = yaml.load(fs.readFileSync('config.yml'))
  self.stringProviders = ['json', 'yaml', 'csv']
}

CLI.prototype.getRepoConfig = function (path) {
  var self = this
  var base = {}
  var repoConfigPath = Path.join(path.source, '_config.yml')

  //Check wheather repo has it's own config
  try {
    fs.lstatSync(repoConfigPath)
    var config = yaml.load(fs.readFileSync(repoConfigPath))
    return _.extend(base, config, path)
  } catch (e) {
    return path
  }
}

CLI.prototype.convert = function (path, provider) {
  var self = this
  var config = self.getRepoConfig(path)
  var sourceProvider = require('../provider/' + provider.source)
  var targetProvider = require('../provider/' + provider.target)
  if (!config.source) throw('no path specified to read from')

  if (_.includes(self.stringProviders, provider.source)) {
    if (!Path.extname(config.source)) console.log('specify a single file to read from')
    var source = fs.readFileSync(config.source, 'utf8')
    if (provider.source === 'json') source = JSON.parse(source)
  } else source = config.source

  sourceProvider.read(source, config)
    .then(function (graph) {
      console.log(graph.getItemKeys().length + ' Items to write')
      var result = targetProvider.write(graph, config)

      if (_.includes(self.stringProviders, provider.target)) {
        if (!config.target) console.log('no path specified to write a file')
        else if (!Path.extname(config.target)) console.log('specify a single file to write to')
        else fs.writeFileSync(config.target, _.isString(result) ? result : JSON.stringify(result))
      }
    })
}

module.exports = new CLI
