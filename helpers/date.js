'use strict';

/**
* Date filter
*
* Syntax:
*   {{ format_date Date }}
*/
var moment = require('moment')
var app = require('../app')

module.exports = function (date){
  //TODO use config setting here
  return moment(date).format('YY MM DD')
}
