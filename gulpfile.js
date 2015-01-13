var gulp = require("gulp");
var browserify = require('browserify');
var transform = require("vinyl-transform");
var source = require("vinyl-source-stream");
var uglify = require("gulp-uglify");
var jade = require("gulp-jade");
var path = require("path");
var copy = require("gulp-copy");

var releaseLocationClient = "./release/client/";
var releaseLocationServer = "./release/server/";

gulp.task("jade", function() {
    return gulp.src("./client/html/**/*.jade")
        .pipe(jade())
        .pipe(gulp.dest(path.join(releaseLocationClient, "html")));
});

gulp.task("copy", function() {
    return gulp.src("./server/**/*.js")
        .pipe(copy(path.join(releaseLocationServer, "..")));
});

// default task that basically bundles all the client side js files into one 
gulp.task("browserify", function () {
    var browserified = transform(function(filename) {
        var b = browserify(filename);
        return b.bundle();
    });
    
    return gulp.src([ "./client/js/index.js" ])
        .pipe(browserified)
        .pipe(uglify())
        .pipe(gulp.dest(path.join(releaseLocationClient, "js")));
});