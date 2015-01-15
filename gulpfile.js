/* Workaround for `possible EventEmitter memory leak detected. 11 listeners added`` */
process.stdout.setMaxListeners(Infinity)

/* Dependencies */
var gulp        = require('gulp')
var jshint      = require('gulp-jshint')
var mocha       = require('gulp-mocha')
var to5         = require('gulp-6to5')
var plumber     = require('gulp-plumber')
var runSequence = require('run-sequence')
var markdox     = require("gulp-markdox")
var concat      = require("gulp-concat")

/* Directories to watch */
var sourceDir = 'src/**/*.js'
var testDir   = 'test/scripts/**/*.js'
var distDir   = 'dist'

/* if watching, do not exit the application if a test failed */
var watching = false

/* Compile ES6 to ES5 */
gulp.task('6to5', function() {
  return gulp
    .src([sourceDir])
    .pipe(plumber())
    .pipe(to5())
    .pipe(gulp.dest(distDir))
})

/* Mocha Unit Tests */
gulp.task('mocha', function(){
  return gulp
    .src('test/index.js')
    .pipe(mocha({
      reporter    : 'nyan',
      ignoreLeaks : true,
      asyncOnly   : true,
      timeout     : 5000,
      debug       : true
    }).on('error', function(err) {
      console.log(err.toString())

      if (watching) {
        this.emit('end') // will not close the watcher
      } else {
        process.exit(1) // return an error code. useful for CI
      }
    }))
})

/* JSHint */
gulp.task('jshint', function(){
  return gulp
    .src(sourceDir)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('default'))
})

/* Execute in order */
gulp.task('compile-then-test', function(callback) {
  runSequence(
    '6to5',
    'jshint',
    'mocha',
    callback
  )
})

gulp.task("doc", function(){
  gulp.src("dist/*.js")
    .pipe(markdox())
    .pipe(concat("doc.md"))
    .pipe(gulp.dest("docs"))
})

/* Watch for file changes, then perform the tests */
gulp.task('watch', function(){
  watching = true
  gulp.watch(sourceDir, ['compile-then-test']) // on every change, run tasks in order
  gulp.watch(['test/index.js', testDir], ['compile-then-test'])
})

gulp.task('test', ['compile-then-test'])

gulp.task('default', ['6to5', 'watch'])
