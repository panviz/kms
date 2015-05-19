'use strict';

/**
* Facebook event tag
*
* Syntax:
*   {{ fbEvent id}}
*/
var H = require('Handlebars')

module.exports = function (id){
  return new H.SafeString(
    '<a class="fb-event" href="http://facebook.com/events/' + id + '">Event on Facebook</a>'
  )
}
