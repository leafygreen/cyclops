'use strict';

const gulp = require('gulp');
const less = require('gulp-less');

const path = require('path');

gulp.task('less', function() {
    return gulp.src('./src/less/**/*.less')
        .pipe(less())
        .pipe(gulp.dest('./dist'));
});
