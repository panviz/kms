/**
 * Server Instance
 */

import express from 'express'
import request from 'request'
import Path from 'path'
import bodyParser from 'body-parser'
import multer from 'multer'
import chalk from 'chalk'
import App from './app'


const upload = multer() // for parsing multipart/form-data
const config = require('./config.json')
const packageConf = require('../package.json')

class Server {
  constructor () {
    this.p = config
    this.p.version = packageConf.version
    this.app = new App(this.p)

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

  initRoutes () {
    this.server.get(/^\/build*/, this._onResourceRequest.bind(this))

    this.server.get('/', this._onRootRequest.bind(this))
    this.server.post(/item/, upload.array(), this._onAPIRequest.bind(this))
    this.server.get(/^(.+)$/, this._onOtherRequest.bind(this))
  }

  _onRootRequest (req, res) {
    res.sendFile(Path.join(this.p.app.path, '/client/index.html'))
  }

  _onResourceRequest (req, res) {
    if (process.env.NODE_ENV === 'DEV') {
      // send request to webpack-dev-server and return response to browser
      const url = req.url.substr(6)
      req.pipe(request.get(`http://localhost:8080${url}`)).pipe(res)
    } else {
      res.sendFile(Path.join(this.p.app.path, req.path))
    }
  }

  _on3dpartyRequest (req, res) {
    res.sendFile(Path.join(this.p.app.path, '..', req.path))
  }

  _onAPIRequest (req, res) {
    this.app.apiServer.request(req.body)
      .then((data) => {
        res.send(data)
      })
  }

  _onOtherRequest (req, res) {
    console.info(`other static request: ${req.params[0]}`)
    res.sendFile(Path.join(this.p.static + req.params[0]))
  }
}
export default new Server
