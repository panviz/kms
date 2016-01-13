var _ = require('lodash')
, fs = require('fs-extra')
, Path = require('path')
, glob = require('glob')
, yaml = require('js-yaml')

var Self = function () {
  var self = this
  self.repos = {}
  self.modules = {}
  self.registerModules()
  //Switch global initialization off
  //Use command line interface for convertion
  //self.config = yaml.load(fs.readFileSync('config.yml'))
  //self.readRepos()
}

//Register modules
Self.prototype.registerModules = function () {
  var self = this
  , paths = []

  paths = glob.sync('../module/**/index.js', {cwd: __dirname})
  paths.forEach(function (path) {
    var name = path.replace(/.*module\/([\w\.]+)\/index.*/i, '$1')
    if (!self.modules[name]) self.modules[name] = {}
    self.modules[name] = require(path)
  })
}

Self.prototype.readRepos = function () {
  var self = this
  , repos = self.config.repositories

  _.keys(repos).forEach(function (options, name) {
    var provider = new self.modules[repo.type](options)
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
    config.source = path
    return _.extend(base, config, p)
  } catch (e) {
    return p
  }
}

module.exports = new Self
