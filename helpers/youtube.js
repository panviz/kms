'use strict';

/**
* Youtube tag
*
* Syntax:
*   {{ youtube video_id }}
*/

module.exports = function (id){
  return '<div class="video-container"><iframe src="//www.youtube.com/embed/' + id + '" frameborder="0" allowfullscreen></iframe></div>';
}
