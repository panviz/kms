'use strict';

/**
* Handlebars Youtube item type
*
* Syntax:
*   {{ youtube video_id }}
*/
var H = require('Handlebars')

module.exports = function (id){
  return new H.SafeString(
    '<div class="video-container"><iframe src="//www.youtube.com/embed/' + id + '" frameborder="0" allowfullscreen></iframe></div>'
  )
}
