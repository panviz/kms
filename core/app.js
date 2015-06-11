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
    var name = path.replace(/.*module\/(\w+)\/provider.*/, '$1')
    self.modules[name] = {provider: require(path)}
  })
  paths = glob.sync('../module/**/view.js', {cwd: __dirname})
  paths.forEach(function (path) {
    var name = path.replace(/.*module\/(\w+)\/view.*/, '$1')
    self.modules[name] = {view: require(path)}
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

module.exports = new Self
