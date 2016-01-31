#!/usr/bin/env node
/**
 * Server launcher
 */
var Path = require('path'),
App = require('./app')

ROOT_PATH = Path.join(__dirname, '/..');

var app = new App
app.run()
