#!/usr/bin/env node

var static = require('node-static')
, http = require('http')
, util = require('util')
, fs = require('fs')

var webroot = './_site',
port = 8080;

var fileServer = new(static.Server)(webroot, { 
  cache: 600, 
  headers: { 'X-Powered-By': 'node-static' } 
});

require('http').createServer(function (req, response) {
  req.addListener('end', function () {

    if (req.url.indexOf('.') === -1) {
      var file = webroot + req.url + '.html';
      if (fs.existsSync(file)) {
        req.url += '.html'
      }
    }

    fileServer.serve(req, response, function (err, res) {
      if (err) {
        console.error('Error serving %s - %s', req.url, err.message);
        if (err.status === 404 || err.status === 500) {
          fileServer.serveFile(util.format('/%d.html', err.status), err.status, {}, req, response);
        } else {
          response.writeHead(err.status, err.headers);
          response.end();
        }
      } else {
        console.log('%s - %s', req.url, res.message); 
      }
    });
  }).resume();
}).listen(8080);
