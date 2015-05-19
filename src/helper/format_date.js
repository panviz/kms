'use strict';

/**
* Date filter
*
* Syntax:
*   {{ format_date Date }}
*/
var moment = require('moment')
var config = require('../config')

module.exports = function (date){
  //TODO use config setting here
  return moment(date).format(config.date_format)
}
