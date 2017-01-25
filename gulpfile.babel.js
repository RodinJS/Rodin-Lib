import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import path from 'path';
import del from 'del';
import runSequence from 'run-sequence';
import babelCompiler from 'babel-core/register';
import * as isparta from 'isparta';

const plugins = gulpLoadPlugins();

const paths = {
	js: ['./**/*.js', '!dist/**', '!node_modules/**', '!coverage/**'],
	nonJs: ['./package.json', './.gitignore'],
	tests: './src/tests/*.js'
};

const options = {
	codeCoverage: {
		reporters: ['lcov', 'text-summary'],
		thresholds: {
		  global: { statements: 80, branches: 80, functions: 80, lines: 80 }
		}
	}
};

