/**
 * Server Instance
 */
import _ from 'lodash'
import express from 'express'
import Path from 'path'
import App from './app'
import Raw from '../provider/raw/index'
import APIServer from '../provider/api.server/index'
import bodyParser from 'body-parser'
import multer from 'multer'
import chalk from 'chalk'
const upload = multer() // for parsing multipart/form-data
const config = require('./config.json')
const packageConf = require('../package.json')

class Self {
  constructor () {
    this.p = config
    this.p.version = packageConf.version
    this.provider = Raw
    this.provider.read(this.p.repository.path)
      .then((graph) => {
        this.graph = graph
        console.info(`Serving items total: ${graph.getItemKeys().length} from ${this.p.repository.path}`)
        this.apiServerProvider = new APIServer({
           source: this.p.repository.path,
           target: this.p.repository.path,
           graph: this.graph,
           provider: this.provider
        })
        this.app = new App(this.graph)
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

  initRoutes (req, res) {
    this.server.get('/', this._onRootRequest.bind(this))
    this.server.get(/client*/, this._onResourceRequest.bind(this))
    this.server.post(/item/, upload.array(), this._onAPIRequest.bind(this))
    this.server.post(/find/, upload.array(), this._onAppRequest.bind(this))
    this.server.get(/select2/, this._onAppSelectInit.bind(this))
    this.server.get(/^(.+)$/, this._onOtherRequest.bind(this))
  }

  _onRootRequest (req, res) {
    res.sendFile(Path.join(this.p.app.path, '/client/index.html'))
  }

  _onResourceRequest (req, res) {
    res.sendFile(Path.join(this.p.app.path, req.path))
  }

  _on3dpartyRequest (req, res) {
    res.sendFile(Path.join(this.p.app.path, '..', req.path))
  }

  _onAppRequest (req, res) {
    this.app[req.body.method](req.body.args)
      .then((data) => {
        res.send(data)
      })
  }

  _onAppSelectInit(req, res){
    let query = req.query.q
    this.app.initAutocomplit(query)
      .then(data => {
        res.send(JSON.stringify(data))
      })
  }

  _onAPIRequest (req, res) {
    this.apiServerProvider.request(req.body)
      .then((data) => {
        res.send(data)
      })
  }

  _onOtherRequest (req, res) {
    console.info(`other static request: ${req.params[0]}`)
    res.sendFile(Path.join(this.p.static + req.params[0]))
  }
}
export default new Self