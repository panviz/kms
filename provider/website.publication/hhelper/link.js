'use strict';

/**
* Handlebars Link item type
*
* Syntax:
*   {{ link Date }}
*/
var H = require('Handlebars')

module.exports = function (url, title){
  //TODO use config setting here
  return new H.SafeString(
    '<a href="' + url + '">' + title + '</a>'
  )
}
