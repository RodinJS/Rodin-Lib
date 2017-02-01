var gulp = require('gulp');
var babel = require('gulp-babel');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var sequence = require('run-sequence');
var del = require('del');
var notify = require('gulp-notify');
var plumber = require('gulp-plumber');
var size = require('gulp-size');
var connect = require('gulp-connect');
var sourcemaps = require('gulp-sourcemaps');

var JS = ['src/**/*.js', '!src/vendor/**'];
var VENDOR = ['src/vendor/**/*.js'];

var ERROR_MESSAGE = {
	errorHandler: notify.onError("Error: <%= error.message %>")
};

const UGLIFY_AGRESIVE = {
    drop_debugger : true,
    mangle: true,
    compress: true
};

gulp.task('js', () => {
	var s = size({title: 'JS -> ', pretty: true});
	return gulp.src(JS)
		.pipe(plumber(ERROR_MESSAGE))
		.pipe(babel())
		.pipe(s)
		.pipe(plumber.stop())
		.pipe(gulp.dest('./dist'))
		.pipe(notify({
			onLast: true,
			message: () => `JS - Total size ${s.prettySize}`
		}));
});

gulp.task('vendor', () => {
	const s = size({title: 'JS production -> ', pretty: true});
	return gulp.src(VENDOR)
		.pipe(plumber(ERROR_MESSAGE))
		.pipe(sourcemaps.init())
		.pipe(uglify(UGLIFY_AGRESIVE))
		.pipe(concat('vendor.js'))
		.pipe(sourcemaps.write('.'))
		.pipe(s)
		.pipe(gulp.dest('./dist/vendor'))
		.pipe(notify({
			onLast: true,
			message: () => `Vendor - Total size ${s.prettySize}`
		}));
});


gulp.task('watch', () => {
	gulp.watch(JS, ['js']);
});

gulp.task('clean', () => {
	return del(['./dist']);
});

gulp.task('connect', () => {
	connect.server({
		root: './',
		port: 8000,
		livereload: true
	});
});

gulp.task('default', (done) => {
	sequence('clean', ['js', 'vendor', 'connect', 'watch'], done);
});
