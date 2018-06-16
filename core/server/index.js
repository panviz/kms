// This file is needed to instruct babel to also compile modules under node_modules/@graphiy
// eslint-disable-next-line
require('babel-core/register')({
  presets: ['env'],
  ignore: /node_modules\/(?!@graphiy)/,
})
require('./src/instance')
