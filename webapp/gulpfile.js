'use strict';

require('babel-register');

const gulp = require('gulp');
require('./gulp/linting');
require('./gulp/less');
require('./gulp/browserify');

gulp.task('default', ['lint', 'less', 'browserify']);
