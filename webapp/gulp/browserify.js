'use strict';

const gulp = require('gulp');
const browserify = require('browserify');
const babelify = require('babelify');
const hbsfy = require('hbsfy');
const source = require('vinyl-source-stream');

const config = {
    entryFile: './src/js/app.js',
    outputDir: './dist',
    outputFile: `app.js`
};

function bundle() {
    return browserify(config.entryFile)
    .transform(babelify)
    .transform(hbsfy.configure({ extensions: ["hbs"] }))
    .bundle()
    .on('error', function(err) { console.log('Error: ' + err.message); })
    .pipe(source(config.outputFile))
    .pipe(gulp.dest(config.outputDir));
}

gulp.task('browserify', bundle);
