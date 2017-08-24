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

const JS = ['!samples/**/systemjs/**/*.*', 'samples/**/*.js'];
const others = ['!samples/**/*.js', 'samples/**/*.*'];
const system = [ 'samples/**/systemjs/**/*.*'];

const ERROR_MESSAGE = {
	errorHandler: notify.onError("Error: <%= error.message %>")
};

gulp.task('js', () => {
	const s = size({title: 'JS -> ', pretty: true});
	return gulp.src(JS)
		.pipe(plumber(ERROR_MESSAGE))
		.pipe(babel())
		.pipe(s)
		.pipe(plumber.stop())
		.pipe(gulp.dest('./build'))
		.pipe(notify({
			onLast: true,
			message: () => `JS - Total size ${s.prettySize}`
		}));
});


gulp.task('others', () => {
    const s = size({title: 'others -> ', pretty: true});
    return gulp.src(others)
        .pipe(plumber(ERROR_MESSAGE))
        .pipe(s)
        .pipe(plumber.stop())
        .pipe(gulp.dest('./build'))
        .pipe(notify({
            onLast: true,
            message: () => `others - Total size ${s.prettySize}`
        }));
});

gulp.task('systemjs', () => {
    const s = size({title: 'others -> ', pretty: true});
    return gulp.src(system)
        .pipe(plumber(ERROR_MESSAGE))
        .pipe(s)
        .pipe(plumber.stop())
        .pipe(gulp.dest('./build'))
        .pipe(notify({
            onLast: true,
            message: () => `others - Total size ${s.prettySize}`
        }));
});

gulp.task('watch', () => {
	gulp.watch(JS, ['js']);
	gulp.watch(others, ['others']);
	gulp.watch(system, ['systemjs'])
});

gulp.task('clean', () => {
	return del(['./build']);
});

gulp.task('connect', () => {
	connect.server({
		root: './',
		port: 9000,
		livereload: true
	});
});

gulp.task('default', (done) => {
	sequence('clean', ['js', 'others', 'systemjs', 'connect', 'watch'], done);
});
