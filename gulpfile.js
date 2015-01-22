var gulp = require("gulp");
var browserify = require("browserify");
var sequence = require("run-sequence");
var transform = require("vinyl-transform");
var source = require("vinyl-source-stream");
var uglify = require("gulp-uglify");
var jade = require("gulp-jade");
var path = require("path");
var copy = require("gulp-copy");
var stylish = require("jshint-stylish");
var jshint = require("gulp-jshint");
var minifyCSS = require("gulp-minify-css");

var releaseLocationClient = "./release/client/";
var releaseLocationServer = "./release/server/";

gulp.task("jade", function() {
    return gulp.src("./client/**/*.jade")
        .pipe(jade())
        .pipe(gulp.dest(path.join(releaseLocationClient, "html")));
});

gulp.task("copy", function() {
    return gulp.src([ "./server/**/*.js", "./server/**/*.json" ])
        .pipe(copy(path.join(releaseLocationServer, "..")));
});

// default task that basically bundles all the client side js files into one 
gulp.task("browserify", function () {
    var browserified = transform(function(filename) {
        var b = browserify(filename);
        return b.bundle();
    });
    
    return gulp.src([ "./client/index.js" ])
        .pipe(browserified)
        .pipe(uglify())
        .pipe(gulp.dest(path.join(releaseLocationClient, "js")));
});

gulp.task("jslint", function() {
    return gulp.src([ "server/**/*.js", "client/**/*.js" ])
        .pipe(jshint())
        .pipe(jshint.reporter(stylish))
        .pipe(jshint.reporter("fail")); 
});

gulp.task("css", function() {
    return gulp.src([ "client/**/*.css" ])
        .pipe(minifyCSS({ keepBreaks: true }))
        .pipe(gulp.dest(releaseLocationClient));
});

// TODO css minify + copy

gulp.task("default", function() {
    // with sequence we parallelize all the operations we can 
    sequence(
        // holy hell.. that got ugly.. let's first fix the issues :,D
         "jslint",
        [ "jade", "copy", "browserify", "css" ]
    ); 
});