// This file is needed to instruct babel to also compile modules under node_modules/@graphiy

require('babel-core/register')({
  ignore: /node_modules\/(?!@graphiy)/
})
require('./instance')
