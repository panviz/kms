var static = require('node-static')
, http = require('http')
, util = require('util')
, fs = require('fs-extra')
, config = require('./src/config')
, Path = require('path')
, port = 4000
, root = './' + config.output_dir

var fileServer = new(static.Server)(root, { 
  cache: 600, 
  headers: { 'X-Powered-By': 'node-static' } 
});

require('http').createServer(function (req, response) {
  req.addListener('end', function () {

    function existsSync (d) {
      try { fs.statSync(d); return true }
      catch (er) { return false }
    }
    if (!existsSync(root + req.url)) {
      var file = root + req.url + '.html';
      if (existsSync(file)) {
        req.url += '.html'
      }
    }

    fileServer.serve(req, response, function (err, res) {
      if (err) {
        console.error('Error serving %s - %s', req.url, err.message);
        if (err.status === 404 || err.status === 500) {
          fileServer.serveFile(util.format('error/%d.html', err.status), err.status, {}, req, response);
        } else {
          response.writeHead(err.status, err.headers);
          response.end();
        }
      } else {
        console.log('%s - %s', req.url, res.message); 
      }
    });
  }).resume();
}).listen(port);
console.log('Server started on:' + port);
