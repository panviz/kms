#!/usr/bin/env node
/**
 * Server runner
 */
// eslint-disable-next-line
const async = require('async')
const fork = require('child_process').fork
const chalk = require('chalk')

const runner = {
  instance: {},
}

runner.config = function (path) {
  runner.path = path
}
runner.start = function (done) {
  runner.instance = fork(runner.path, { silent: true })
  runner.instance.stdout.pipe(process.stdout)
  runner.instance.stderr.pipe(process.stderr)

  console.info(chalk.cyan('Starting'), 'server instance (PID:', runner.instance.pid, ')')
  if (done) done()
}

runner.stop = function (done) {
  if (runner.instance.connected) {
    runner.instance.on('exit', () => {
      console.info(chalk.red('Stopping'), 'server instance ( PID:', runner.instance.pid, ')')
      if (done) done()
    })
    runner.instance.kill('SIGINT')
    return
  }
  if (done) done()
}

runner.restart = function (callback) {
  async.series([
    runner.stop,
    runner.start,
  ], () => {
    callback()
  })
}

module.exports = runner
