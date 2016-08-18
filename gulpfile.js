const _ = require('lodash')// eslint-disable-line
const gulp = require('gulp')
const concat = require('gulp-concat')
const uglify = require('gulp-uglify')
const sourcemaps = require('gulp-sourcemaps')
const sass = require('gulp-sass')
const handlebars = require('gulp-handlebars')
const tap = require('gulp-tap')
const declare = require('gulp-declare')
const babel = require('gulp-babel')
const gutil = require('gulp-util')
const livereload = require('gulp-livereload')
const wrap = require('gulp-wrap')
const mocha = require('gulp-mocha')

// required for mocha
require('babel-core/register')

const fs = require('fs-extra')
const del = require('del')
const Handlebars = require('handlebars')
const source = require('vinyl-source-stream')
const buffer = require('vinyl-buffer')
const browserify = require('browserify')
const watchify = require('watchify')
const babelify = require('babelify')
const Path = require('path')

const indexLibs = require('./client/indexLibs.json')
let appConfig = require('./server/config.json')
const testConfig = require('./fixture/config.json')
const runner = require('./server/runner')
let NODE_ENV = process.env.NODE_ENV

if (NODE_ENV === 'TEST') appConfig = testConfig
if (!_.get(appConfig, 'app.path')) throw new Error('specify build path')

NODE_ENV = NODE_ENV || appConfig.env.name
const DEV = NODE_ENV === 'DEV'
const path = {
  styles: 'client/**/*.scss',
  stylesIndex: 'client/index.scss',
  js: {
    client: 'client/js/**/*.js',
    clientIndex: 'client/app.js',
    serverIndex: `${appConfig.app.path}/server/instance.js`,
    lib: indexLibs,
  },
  // TODO if there is templates compilation why to add htmls to assets?
  asset: ['client/**/*.svg', 'client/**/*.html'],
  template: 'client/**/*.html',
  core: 'core/**/*.js',
  server: 'server/**/*.js',
  provider: 'provider/**/*.js',
  app: {
    root: appConfig.app.path,
    client: `${appConfig.app.path}/client`,
    core: `${appConfig.app.path}/core`,
    server: `${appConfig.app.path}/server`,
    provider: `${appConfig.app.path}/provider`,
  },
  test: 'test/**/*.js',
}
runner.config(path.js.serverIndex)
const babelConfig = { plugins: ['transform-es2015-modules-commonjs'] }
const sassConfig = { outputStyle: 'compressed' }

// add custom browserify options here
const clientJSConfig = {
  entries: [path.js.clientIndex],
  debug: true,
}
const bundlerOptions = _.assign({}, watchify.args, clientJSConfig)

function makeBundler (doWatch) {
  let bundler = browserify(bundlerOptions)
  if (doWatch) bundler = watchify(bundler)
  function bundle () {
    return bundler.bundle()
      // log errors if they happen
      .on('error', gutil.log.bind(gutil, 'Browserify Error'))
      .pipe(source('bundle.js'))
      // optional, remove if you don't need to buffer file contents
      .pipe(buffer())
      .pipe(DEV ? gutil.noop() : uglify())
      // loads map from browserify file
      .pipe(DEV ? sourcemaps.init({ loadMaps: true }) : gutil.noop())
      .pipe(DEV ? sourcemaps.write('./') : gutil.noop()) // writes .map file
      .pipe(gulp.dest(path.app.client))
      .pipe(DEV ? livereload() : gutil.noop())
  }
  bundler.transform(babelify.configure(babelConfig))
  bundler.on('update', bundle) // on any dep update, runs the bundler
  bundler.on('log', gutil.log) // output build logs to terminal
  return bundle
}

gulp.task('client', () => {
  makeBundler()()
})

gulp.task('clean', () =>
  del([path.app.root])
)

gulp.task('lib', () =>
  gulp.src(path.js.lib)
    .pipe(DEV ? gutil.noop() : uglify())
    .pipe(concat('libs.js'))
    .pipe(gulp.dest(path.app.client))
)

gulp.task('styles', () => {
  gulp.src(path.stylesIndex)
    .pipe(sass(sassConfig).on('error', sass.logError))
    .pipe(concat('bundle.css'))
    .pipe(gulp.dest(path.app.client))
    .pipe(DEV ? livereload() : gutil.noop())
})

gulp.task('template', () => {
  gulp.src(path.template)
    .pipe(tap((file, t) => {
      file.path = Path.relative(file.base, file.path) //eslint-disable-line
    }))
    .pipe(handlebars({
      handlebars: Handlebars,
    }))
    .pipe(wrap('Handlebars.template(<%= contents %>)'))
    .pipe(declare({
      namespace: 'G.Templates',
      processName (filePath) {
        // strip .js extension out
        return filePath.slice(0, -3)
      },
      noRedeclare: true,
    }))
    .pipe(uglify())
    .pipe(concat('templates.js'))
    .pipe(gulp.dest(path.app.client))
    .pipe(DEV ? livereload() : gutil.noop())
})

// Copy all static assets
gulp.task('asset', () =>
  gulp.src(path.asset)
    .pipe(gulp.dest(path.app.client))
    .pipe(DEV ? livereload() : gutil.noop())
)

gulp.task('frontend', ['client', 'template', 'lib', 'asset', 'styles'])

// BACKEND ----------------------------------------------

gulp.task('core', () => {
  gulp.src(path.core)
    .pipe(babel(babelConfig))
    .on('error', (err) => console.error(err))
    .pipe(gulp.dest(path.app.core))
})

gulp.task('server', () => {
  fs.copy('./package.json', Path.join(path.app.root, 'package.json'))
  fs.copy('./server/config.json', Path.join(path.app.server, 'config.json'))
  gulp.src(path.server)
    .pipe(babel(babelConfig))
    .on('error', (err) => console.error(err))
    .pipe(gulp.dest(path.app.server))
})

gulp.task('provider', () => {
  gulp.src(path.provider)
    .pipe(sourcemaps.init())
    .pipe(babel(babelConfig))
    .on('error', (err) => console.error(err))
    .pipe(DEV ? sourcemaps.write('.') : gutil.noop())
    .pipe(gulp.dest(path.app.provider))
})

gulp.task('start', () => {
  runner.start()
})

gulp.task('restart', () => {
  runner.restart(() => {
    setTimeout(() => {
      livereload.reload()
    }, 1000)
  })
})

gulp.task('backend', ['core', 'server', 'provider'])

// END BACKEND ---------------------------------------

gulp.task('watch', () => {
  gulp.watch(path.styles, ['styles'])
  gulp.watch(path.asset, ['asset'])
  gulp.watch(path.template, ['template'])
  gulp.watch(path.core, ['core', 'restart'])
  gulp.watch(path.server, ['server', 'restart'])
  gulp.watch(path.provider, ['provider', 'restart'])
  makeBundler(true)()
  if (DEV) livereload.listen()
})

gulp.task('fixture', () => {
  fs.copy('fixture/config.json', Path.join(path.app.server, 'config.json'))
})

gulp.task('test', () => {
  gulp.src(path.test, { read: false })
    .pipe(mocha())
})

gulp.task('build', ['clean', 'backend', 'frontend'])
gulp.task('default', ['start', 'watch'])
