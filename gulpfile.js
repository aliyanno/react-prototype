var gulp = require('gulp');
var browserify = require('gulp-browserify');
var babel = require('gulp-babel');
var watch = require('gulp-watch');
var sass = require('gulp-sass');
var connect = require('gulp-connect');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var plumber = require('gulp-plumber');

gulp.task('connect', function() {
  return connect.server({ port: 3333, livereload: true });
});

var compileJs = function(stream){
  return stream
  .pipe(plumber())
  .pipe(browserify({transform: ['babelify']}))
  .pipe(rename({extname: '.js'}))
  .pipe(gulp.dest('dist'));
};

var compileSass = function(stream){
  return stream
  .pipe(plumber())
  .pipe(sass())
  .pipe(rename({extname: '.css'}))
  .pipe(gulp.dest('dist'));
};

gulp.task('watchJs', function(){
  return watch('src/**/*.{js,jsx}', function(){
    compileJs(gulp.src('src/app.jsx'))
  })
  .on('data', function(file){
    console.log(file.event, ' >>>> ', file.path);
  });
});

gulp.task('watchSass', function(){
  return watch('style/**/*.{scss,css}', function(){
    compileSass(gulp.src('src/app.scss'));
  })
  .on('data', function(file){
    console.log(file.event, ' >>>> ', file.path);
  });
});

gulp.task('default', ['connect', 'watchJs', 'watchSass']);