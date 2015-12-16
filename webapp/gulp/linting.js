'use strict';

const gulp = require('gulp');
const jshint = require('gulp-jshint');
const jscs = require('gulp-jscs');

function lint(files, options) {
    return gulp.src(files)
        .pipe(jshint())
        .pipe(jscs(options))
        .pipe(jscs.reporter());
}

function lintSrc() {
    return lint(['src/**/*.js']);
}

function lintTest() {
    return lint(['test/**/*.js']);
}

gulp.task('lint-src', lintSrc);

gulp.task('lint-test', lintTest);

gulp.task('lint-code', ['lint-src', 'lint-test']);

gulp.task('lint', ['lint-code']);