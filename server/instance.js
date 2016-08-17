/**
 * Server Application
 */
import express from 'express'
import Path from 'path'
import APIServer from '../provider/api.server/index'
import bodyParser from 'body-parser'
import multer from 'multer'
import chalk from 'chalk'
const upload = multer() // for parsing multipart/form-data
const config = require('./config.json')
const packageConf = require('../package.json')

function Self () {
  this.p = config
  this.p.version = packageConf.version
  this.provider = new APIServer({
    source: this.p.repository.path,
    target: this.p.repository.path,
    provider: this.p.repository.provider,
  })

  this.server = express()
  this.server.use(bodyParser.json())
  this.server.use(bodyParser.urlencoded({ extended: true }))
  this.initRoutes()
  this.server.listen(this.p.env.port, () => {
    console.info(chalk.cyan('Graphiy'),
      chalk.grey(this.p.version),
      'running as ',
      chalk.white(this.p.env.name),
      ` on http://${this.p.env.host}:${this.p.env.port}`
    )
  })
}

Self.prototype.initRoutes = function (req, res) {
  this.server.get('/', this._onRootRequest.bind(this))
  this.server.get(/client*/, this._onResourceRequest.bind(this))
  this.server.get(/node_modules*/, this._on3dpartyRequest.bind(this))
  this.server.post(/item/, upload.array(), this._onAppRequest.bind(this))
  this.server.get(/^(.+)$/, this._onOtherRequest.bind(this))
}

Self.prototype._onRootRequest = function (req, res) {
  res.sendFile(Path.join(this.p.app.path, '/client/index.html'))
}

Self.prototype._onResourceRequest = function (req, res) {
  res.sendFile(Path.join(this.p.app.path, req.path))
}

Self.prototype._on3dpartyRequest = function (req, res) {
  res.sendFile(Path.join(this.p.app.path, '..', req.path))
}

Self.prototype._onAppRequest = function (req, res) {
  this.provider.request(req.body)
    .then((data) => {
      res.send(data)
    })
}

Self.prototype._onOtherRequest = function (req, res) {
  console.info(`other static request: ${req.params[0]}`)
  res.sendFile(Path.join(this.p.static + req.params[0]))
}

export default new Self
