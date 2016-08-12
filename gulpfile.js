const gulp = require('gulp')
const concat = require('gulp-concat')
const uglify = require('gulp-uglify')
const sourcemaps = require('gulp-sourcemaps')
const sass = require('gulp-sass')
const handlebars = require('gulp-handlebars')
const tap = require('gulp-tap')
const declare = require('gulp-declare')
const babel = require('gulp-babel')

const del = require('del')
const Handlebars = require('handlebars')
const source = require('vinyl-source-stream')
const buffer = require('vinyl-buffer')
const browserify = require('browserify')
const watchify = require('watchify')
const babelify = require('babelify')
const Path = require('path')

const indexLibs = require('./client/indexLibs.json')

const path = {
  styles: 'client/**/*.scss',
  js: 'client/js/**/*.js',
  lib: indexLibs,
  asset: ['client/**/*.svg', 'client/**/*.html'],
  template: 'client/**/*.html',
  server: ['core', 'server', 'provider'],
}

gulp.task('server', () => {
  path.server.forEach((serverPath) => {
    gulp.src(`${serverPath}/**/*.js`)
      .pipe(sourcemaps.init())
      .pipe(babel({
        presets: ['es2015'],
      }))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(`build/${serverPath}`))
  })
})

function compile (doWatch) {
  const bundler = watchify(browserify('./client/app.js', { debug: true })
    .transform(babelify.configure({
      presets: ['es2015'],
    }))
  )

  function rebundle () {
    bundler.bundle()
      .on('error', (err) => {
        console.error(err)
        this.emit('end')
      })
      .pipe(source('build.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('build/client/'))
  }

  if (doWatch) {
    bundler.on('update', () => {
      console.info('-> bundling...')
      rebundle()
    })
  }

  rebundle()
}

function watch () {
  return compile(true)
}

gulp.task('build-styles', () => {
  gulp.src('client/index.scss')
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(concat('bundle.css'))
    .pipe(gulp.dest('./build/client/'))
})

gulp.task('styles', () => {
  gulp.src('client/index.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(concat('bundle.css'))
    .pipe(gulp.dest('./build/client/'))
})

gulp.task('clean', () =>
  del(['build'])
)

gulp.task('js', () => compile())
gulp.task('lib', () =>
  // Minify and copy all JavaScript (except vendor scripts)
  // with sourcemaps all the way down
  gulp.src(path.lib)
    .pipe(uglify())
    .pipe(concat('libs.js'))
    .pipe(gulp.dest('build/client'))
)

gulp.task('template', () => {
  gulp.src(path.template)
    .pipe(tap((file, t) => {
      file.path = Path.relative(file.base, file.path)
    }))
    .pipe(handlebars({
      handlebars: Handlebars,
    }))
    .pipe(declare({
      namespace: 'G.Templates',
      processName (filePath) {
        return filePath
      },
      noRedeclare: true,
    }))
    .pipe(uglify())
    .pipe(concat('templates.js'))
    .pipe(gulp.dest('build/client/'))
})

// Copy all static assets
gulp.task('asset', () =>
  gulp.src(path.asset)
    .pipe(gulp.dest('build/client'))
)

gulp.task('watch', () => {
  gulp.watch(path.styles, ['styles'])
  //gulp.watch(path.js, ['js'])
  gulp.watch(path.asset, ['asset'])
  gulp.watch(path.template, ['template'])
})

//gulp.task('watch', function() { return watch() })

gulp.task('build', [
  'clean',
  'server',
  'build-css',
  'build-js',
  'lib',
  'build-asset',
  'build-template',
])
// The default task (called when you run `gulp` from cli)
gulp.task('default', ['watch'])
