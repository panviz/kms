'use strict';

/**
* Picture tag
*
* Syntax:
*   {{ picture srcPath }}
*/
var H = require('Handlebars')

module.exports = function (path){
  var name = path //TODO get filename from path

  return new H.SafeString(
    '<img src="/image/' + path + '" title="'+ name +'" alt="' + name + '"/>'
  )
}
