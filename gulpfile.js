/* jshint browser:false, node:true */
var gulp = require('gulp');
var gutil = require('gulp-util');
var jshint = require('gulp-jshint');
var resolve = require('path').resolve;
var abs = resolve.bind(null, __dirname);

/**
 * path config
 * all paths should be absolute
 *
 * @type {object}
 */
var paths = {};

// the projects root directory
paths.ROOT = abs('.');

// the source files for your app
paths.SRC = abs('src');

// the dir used to create archives in DIST
paths.DIST = abs('dist');

// dir for final tar/zip version of the site
paths.BUILD = abs('build');

// main module, imports all other modules for your app
paths.ENTRY = resolve(paths.SRC, 'index.js');

// output file for the bundle
paths.BUNDLE = resolve(paths.BUILD, 'bundle.js');

/**
 * Start a webpack-dev-server that will compile
 * our files and serve them
 *
 * info: http://webpack.github.io/docs/webpack-dev-server.html
 * config docs: http://webpack.github.io/docs/configuration.html
 */
gulp.task('server', function (done) {
  var express = require('express');
  var app = express();
  app.use(express.static(paths.SRC));
  app.use(express.static(paths.BUILD));

  getPacker(true).watch(200, function (err, stats) {
    if (err)
      return gutil.error(new gutil.PluginError('webpack', err));

    if (stats.hasErrors() || stats.hasWarnings())
      return gutil.log(stats.toString());

    var names = stats.toJson().assets.map(function (asset) {
      return asset.name;
    });

    gutil.log(gutil.colors.green('✓'), 're-built', names.join(', '));
  });

  app.listen(8000, function (err) {
    if (err) done(new gutil.PluginError('webpack', err));
    else gutil.log('Server listening at http://localhost:8080');
  });
});

gulp.task('lint', function () {
  return gulp.src(resolve(paths.SRC, '**/*.js'))
    .pipe(jshint({ linter: require('jshint') }))
    .pipe(jshint.reporter())
    .pipe(jshint.reporter('fail'));
});

function getPacker(dev) {
  var webpack = require('webpack');
  return webpack(require('./webpack.build.config.js')(paths, dev));
}
