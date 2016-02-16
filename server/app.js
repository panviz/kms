/**
 * Server Application
 */
var express = require('express')
, Path = require('path')
, APIServer = require('../provider/api.server/index')
, bodyParser = require('body-parser')
, multer = require('multer')
, upload = multer() // for parsing multipart/form-data


var Self = function () {
  var self = this
  self.p = require('./config.json')
  var packageConf = require('../package.json')
  self.p.version = packageConf['version']
  self.provider = new APIServer({
    source: self.p.repository.path,
    target: self.p.repository.path,
    provider: self.p.repository.provider,
  })
  
  self.server = express()
  self.server.use(bodyParser.json())
  self.server.use(bodyParser.urlencoded({ extended: true }))
  self.initRoutes()
}

Self.prototype.run = function () {
  var self = this

  self.server.listen(self.p.env.port, function() {
    console.log('\x1b[36mGraph\x1b[90m v%s\x1b[0m running as \x1b[1m%s\x1b[0m on http://%s:%d'
      , self.p.version
      , self.p.env.name
      , self.p.env.host
      , self.p.env.port
    )
  }) 
}

Self.prototype.initRoutes = function (req, res) {
  var self = this
  self.server.get('/', self._onRootRequest.bind(self))
  self.server.get(/client*/, self._onResourceRequest.bind(self))
  self.server.get(/node_modules*/, self._onResourceRequest.bind(self))
  self.server.post(/item/, upload.array(), self._onAppRequest.bind(self))
  self.server.get(/^(.+)$/, self._onOtherRequest.bind(self))
}

Self.prototype._onRootRequest = function (req, res) {
  var self = this
  res.sendFile(ROOT_PATH + '/client/index.html')
}

Self.prototype._onResourceRequest = function (req, res) {
  var self = this
  res.sendFile(Path.join(ROOT_PATH + req.path))
}

Self.prototype._onAppRequest = function (req, res) {
  var self = this
  self.provider.request(req.body)
    .then(function (data) {
      res.send(data)
    })
}

Self.prototype._onOtherRequest = function(req, res){ 
  var self = this
  console.log('other static request: ' + req.params[0])
  res.sendFile(Path.join(self.p.static + req.params[0]))
}
var idPattern = /^[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$/

module.exports = Self
