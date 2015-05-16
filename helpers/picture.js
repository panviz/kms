'use strict';

/**
* Picture tag
*
* Syntax:
*   {{ picture srcPath }}
*/

module.exports = function (path){
  var name = path //TODO get filename from path

  return '<img src="/image/' + path + '" title="'+ name +'" alt="' + name + '"/>'
}
