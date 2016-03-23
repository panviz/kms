#!/usr/bin/env node
/**
 * Server launcher
 */
import Path from 'path'
import App from './app'

global.ROOT_PATH = Path.join(__dirname, '/../..')

const app = new App
app.run()
