var Q = require("q");
var mkdirp = require("mkdirp");
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
var todo = require("gulp-todo");
var to5ify = require("6to5ify");
var fs = require("fs");
var to5 = require("gulp-6to5");
var jsdoc = require("gulp-jsdoc");

var releaseLocationClient = "./release/client/";
var releaseLocationServer = "./release/server/";

var createBrowserifyTask = function(debug) {
    return browserify({ debug: debug })
        .transform(to5ify)
        .require( "./client/index.js", { entry: true })
        .bundle()
        .on("error", function(error) { console.log("Error: " + error.message); })
        .pipe(fs.createWriteStream(path.join(releaseLocationClient, "js", "index.min.js")));
}

gulp.task("jade", function() {
    return gulp.src("./client/**/*.jade")
        .pipe(jade())
        .pipe(gulp.dest(path.join(releaseLocationClient, "html")));
});

gulp.task("node-es6to5", function() {
    return gulp.src([ "./server/**/*.js" ])
        .pipe(to5())
        .pipe(gulp.dest(path.join(releaseLocationServer)));
});

gulp.task("uglify", function() {
   gulp.src([ path.join(releaseLocationClient, "js", "index.min.js") ])
       .pipe(uglify())
       .pipe(gulp.dest(path.join(releaseLocationClient, "js")))
});

gulp.task("copy", function() {
    return gulp.src([ "./server/**/*.json" ])
        .pipe(copy(path.join(releaseLocationServer, "..")));
});

gulp.task("browserify", function () {
    return createBrowserifyTask(false);
});

gulp.task("browserify-debug", function () {
    return createBrowserifyTask(true);
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

// generate a todo.md from your javascript files
gulp.task("todo", function() {
    return gulp.src([ "./server/*.*", "./client/*.*" ])
        .pipe(todo())
        .pipe(gulp.dest("."));
});

gulp.task("jsdoc", function() {
    //return gulp.src("./");
});

var driveSequence = function(isDebug) {
    var browser = isDebug ? "browserify-debug" : "browserify";
    var lastStep = isDebug ? [ "todo" ] : [ "todo", "uglify" ];
    
    sequence(
        [ "jslint" ],
        [ "node-es6to5", "jade", "copy", browser, "css" ],
        lastStep
    ); 
}

var makeDir = function(path) {
    var deferred = Q.defer();

    mkdirp(path, function(error) {
        if (error) {
            deferred.reject(error);
        } else {
            deferred.resolve(error);
        }

    });

    return deferred.promise;
}

gulp.task("debug", function() {
    Q.all([
        makeDir(path.join(releaseLocationClient, "js"))
    ])
    .done(function() {
        driveSequence(true);
    }, 
    function() {
        driveSequence(true);
    });
});

gulp.task("default", function() {
    Q.all([
        makeDir(path.join(releaseLocationClient, "js"))
    ])
    .done(function() {
        driveSequence(false);
    }, 
    function() {
        driveSequence(false);
    });
});