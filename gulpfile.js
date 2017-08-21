const gulp = require('gulp');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const sequence = require('run-sequence');
const del = require('del');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const size = require('gulp-size');
const connect = require('gulp-connect');
const sourcemaps = require('gulp-sourcemaps');
const gzip = require('gulp-gzip');

const JS = ['src/**/*.js', '!src/vendor/**'];
const VENDOR = ['src/vendor/joi.min.js', 'src/vendor/three.min.js', 'src/vendor/**/*.js'];

const ERROR_MESSAGE = {
	errorHandler: notify.onError("Error: <%= error.message %>")
};

const UGLIFY_AGRESIVE = {
    drop_debugger : true,
    mangle: true,
    compress: true
};

const GZIP_OPTIONS = {
	deleteMode: 'dist/'
};

gulp.task('js', () => {
	const s = size({title: 'JS -> ', pretty: true});
	return gulp.src(JS)
		.pipe(plumber(ERROR_MESSAGE))
		.pipe(babel())
		.pipe(s)
		 .pipe(gzip())
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
		// .pipe(sourcemaps.init())
		.pipe(uglify(UGLIFY_AGRESIVE))
		.pipe(concat('vendor.js'))
		// .pipe(sourcemaps.write('.'))
		.pipe(s)
		 .pipe(gzip())
		.pipe(plumber.stop())
		.pipe(gulp.dest('./dist/vendor'))
		.pipe(notify({
			onLast: true,
			message: () => `Vendor - Total size ${s.prettySize}`
		}));
});


gulp.task('watch', () => {
	gulp.watch(JS, ['js']);
	gulp.watch(VENDOR, ['vendor']);
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
