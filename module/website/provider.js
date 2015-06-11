/**
 * Converts special structure from FileSystem to static website
 */
var fs = require('fs')
, Path = require('path')
, glob = require('glob')
, _ = require('lodash')
, DB = require('../object/provider')

var Self = function (config) {
  this.config = config
    var config
    if (options.path) config = self.getRepoConfig(options.path)
    config.name = config.name || config['repository.name'] || name
    config.type = config.type || config['repository.type'] || options.type

    self.repos[name] = config
}

Self.prototype.getRepoConfig = function (options) {
  var repoConfigPath = Path.join(options.path, '_config.yml')

  //Check wheather repo has it's own config
  try {
    fs.lstatSync(repoConfigPath)
    return yaml.load(fs.readFileSync(repoConfigPath))
  } catch (e) {
    return
  }
}

Self.prototype.parseMultiSiteConfig = function (baseConfig) {
    if (_.isArray(config.website)) {
      repoConfigs = _.union(repoConfigs, self.parseMultiSiteConfig(config))
    } else {
      repoConfigs.push(config)
    }
  return _.map(baseConfig.website, function (config) {
    return _.extend({}, baseConfig, _.values(config)[0], {name: _.keys(config)[0]})
  })
}

Self.prototype.read = function () {
  var self = this

  if (config.exclude_dir) {
  }
  self.sections = _.map(glob.sync('*/', {cwd: 'content'}), function (path) {
    return path.replace('/', '')
  })
  self.sections = _.difference(self.sections, self.specialSections)
  _.each(self.sections, function (section) {
    self.processSection(section)
  })
}

Self.prototype.processSection = function (section) {
  var self = this

  var folderPath = Path.join(config.content_dir, section)
  var files = glob.sync('**/*.html', {cwd: folderPath})

  _.each(files, function (filename) {
    var page = self.read(Path.join(folderPath, filename))
    DB.setPage(page)
  })
}

Self.prototype.readPage = function (path) {
  var s = fs.readFileSync(path, 'utf8')
  if (!s) return

  var self = this
  , data = s.split('---')
  
  if (!s.match('---')) return {content: s}

  var parsed = yaml.load(data[1], 'utf8')
  parsed.content = data[2]

  return parsed
}

Self.prototype.read = function (path) {
  var self = this

  var parsed = pageProcessor(path)
  var path = Path.relative(config.content_dir, path)
  return new Page(path, parsed, config)
}

module.exports = Self
