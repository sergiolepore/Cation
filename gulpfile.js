/* Dependencies */
var gulp   = require('gulp');
var jshint = require('gulp-jshint');
var mocha  = require('gulp-mocha');

/* Directories to watch */
var lib  = 'lib/**/*.js';
var test = 'test/scripts/**/*.js';

/* Mocha Unit Tests */
gulp.task('mocha', function(){
  return gulp
  .src('test/index.js')
  .pipe(mocha({
    reporter: 'spec',
    ignoreLeaks: true
  }))
  ;
});

/* JSHint */
gulp.task('jshint', function(){
  return gulp
  .src(lib)
  .pipe(jshint())
  .pipe(jshint.reporter('jshint-stylish'))
  .pipe(jshint.reporter('fail'))
  ;
});

/* Watch for file changes, then perform the tests */
gulp.task('watch', function(){
  gulp.watch(lib, ['mocha', 'jshint']);
  gulp.watch(['test/index.js', test], ['mocha']);
});

gulp.task('test', ['mocha', 'jshint']);
