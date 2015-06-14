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
  self.config = yaml.load(fs.readFileSync('config.yml'))
  //self.readRepos()
}

//Register modules
Self.prototype.registerModules = function () {
  var self = this
  , paths = []

  paths = glob.sync('../module/**/provider.js', {cwd: __dirname})
  paths.forEach(function (path) {
    var name = path.replace(/.*module\/([\w\.]+)\/provider.*/i, '$1')
    if (!self.modules[name]) self.modules[name] = {}
    self.modules[name].provider = require(path)
  })
  paths = glob.sync('../module/**/view.js', {cwd: __dirname})
  paths.forEach(function (path) {
    var name = path.replace(/.*module\/([\w\.]+)\/view.*/, '$1')
    if (!self.modules[name]) self.modules[name] = {}
    self.modules[name].view = require(path)
  })
}

Self.prototype.readRepos = function () {
  var self = this
  , repos = self.config.repositories

  _.keys(repos).forEach(function (options, name) {
    var provider = new self.modules[repo.type].provider(options)
    provider.read()
  })
}

Self.prototype.getRepoConfig = function (path, options) {
  var repoConfigPath = Path.join(path, '_config.yml')

  //Check wheather repo has it's own config
  try {
    fs.lstatSync(repoConfigPath)
    var config = yaml.load(fs.readFileSync(repoConfigPath))
    config.path = path
    return _.extend({}, config, options)
  } catch (e) {
    return
  }
}

module.exports = new Self
