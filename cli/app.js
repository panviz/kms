var _ = require('lodash')
, fs = require('fs-extra')
, Path = require('path')
, glob = require('glob')
, yaml = require('js-yaml')

var Self = function () {
  var self = this
  self.repos = {}
  self.providers = {}
  self.registerModules()
  //Switch global initialization off
  //Use command line interface for convertion
  //self.config = yaml.load(fs.readFileSync('config.yml'))
  //self.readRepos()
}

//Register providers
Self.prototype.registerModules = function () {
  var self = this
  , paths = []

  paths = glob.sync('../provider/**/index.js', {cwd: __dirname})
  paths.forEach(function (path) {
    var name = path.replace(/.*provider\/([\w\.]+)\/index.*/i, '$1')
    if (!self.providers[name]) self.providers[name] = {}
    self.providers[name] = require(path)
  })
}

Self.prototype.readRepos = function () {
  var self = this
  , repos = self.config.repositories

  _.keys(repos).forEach(function (options, name) {
    var provider = new self.providers[repo.type](options)
    provider.read()
  })
}

Self.prototype.getRepoConfig = function (p) {
  var self = this
  var base = {}
  var repoConfigPath = Path.join(p.source, '_config.yml')

  //Check wheather repo has it's own config
  try {
    fs.lstatSync(repoConfigPath)
    var config = yaml.load(fs.readFileSync(repoConfigPath))
    return _.extend(base, config, p)
  } catch (e) {
    return p
  }
}

module.exports = new Self
