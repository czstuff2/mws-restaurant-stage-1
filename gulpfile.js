var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var babelify = require('babelify');
var browserify = require('browserify');
var fs = require('fs');
var babel = require("babel-core");

gulp.task('default', ['copy-html', 'copy-images', 'styles', 'scripts']);

gulp.task('dist', [
	'copy-html',
	'copy-images',
	'styles',
	'scripts-dist'
])

gulp.task('scripts', function() {
	gulp.src(['js/**/*.js'])
	//	.pipe(concat('all.js'))
		.pipe(gulp.dest('dist/js'));
	gulp.src(['sw.js'])
	//	.pipe(concat('all.js'))
		.pipe(gulp.dest('dist')); 
	/*browserify(['js/dbhelper.js'])
		.transform('babelify', {presets: ["babel-preset-es2015"]})
		.bundle()
		.pipe(fs.createWriteStream('dist/js/dbhelper.js'))
	browserify(['js/main.js'])
		.transform('babelify', {presets: ["babel-preset-es2015"]})
		.bundle()
		.pipe(fs.createWriteStream('dist/js/main.js'))*/
})


gulp.task('scripts-dist', function() {
	gulp.src('js/**/*.js')
		.pipe(concat('all.js'))
		.pipe(uglify())
		.pipe(gulp.dest('dist/js'));
});

gulp.task('copy-html', function() {
	gulp.src(['./index.html', './restaurant.html'])
		.pipe(gulp.dest('./dist'));
});

gulp.task('copy-images', function() {
	gulp.src('img/*')
		.pipe(gulp.dest('dist/img'));
});

gulp.task('styles', function() {
	gulp.src('css/**/*.css')
		.pipe(gulp.dest('dist/css'))
});