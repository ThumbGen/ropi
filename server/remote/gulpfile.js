"use strict";

//******************************************************************************
//* DEPENDENCIES
//******************************************************************************

var gulp        = require("gulp"),
    tsc         = require("gulp-typescript"),
    sourcemaps  = require("gulp-sourcemaps"),
    uglify      = require("gulp-uglify"),
    browserify  = require("browserify"),
    source      = require("vinyl-source-stream"),
    buffer      = require("vinyl-buffer"),
    runSequence = require("run-sequence"),
    browserSync = require("browser-sync").create();
    
var distFolder  = "RoPiRemote";
//******************************************************************************
//* LINT
//******************************************************************************
//gulp.task("lint", function() {
//    return gulp.src([
//        "source/**/**.ts",
//        "test/**/**.test.ts"
//    ])
//    .pipe(tslint({ }))
//    .pipe(tslint.report("verbose"));
//});

//******************************************************************************
//* BUILD
//******************************************************************************
var tsProject = tsc.createProject("tsconfig.json");

gulp.task("build-app", function() {
    return gulp.src([
            "source/app/**/**.ts",
            "typings/main.d.ts/"
        ])
        .pipe(tsc(tsProject))
        .js.pipe(gulp.dest("source/js"));
});

//var tsTestProject = tsc.createProject("tsconfig.json");

//gulp.task("build-test", function() {
//    return gulp.src([
//            "test/**/*.ts",
//            "typings/main.d.ts/",
//            "source/interfaces/interfaces.d.ts"
//        ])
//        .pipe(tsc(tsTestProject))
//        .js.pipe(gulp.dest("test/"));
//});

gulp.task("build", function(cb) {
    runSequence(["build-app"/*, "build-test"*/], cb);
});

//******************************************************************************
//* COPY STATIC ASSETS
//******************************************************************************
gulp.task('copy', function() {
  gulp.src('source/js/vendor/**')
    .pipe(gulp.dest(distFolder + '/js/vendor'));    
    
  gulp.src('source/images/**')
    .pipe(gulp.dest(distFolder + '/images'));

  gulp.src('source/css/**')
    .pipe(gulp.dest(distFolder + '/css'));
  
  gulp.src('source/fonts/**')
    .pipe(gulp.dest(distFolder + '/fonts'));

  gulp.src('source/*.html')
    .pipe(gulp.dest(distFolder));
});

//******************************************************************************
//* BUNDLE
//******************************************************************************
gulp.task("bundle", function() {
  
    var libraryName = "application";
    var mainTsFilePath = "source/js/application.min.js";
    var outputFolder   = distFolder + "/js";
    var outputFileName = libraryName + ".min.js";

    var bundler = browserify({
        debug: true,
        standalone : libraryName
    });
    
    return bundler.add(mainTsFilePath)
        .bundle()
        .pipe(source(outputFileName))
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(outputFolder));
});

//******************************************************************************
//* DEV SERVER
//******************************************************************************
gulp.task("watch", ["default"], function () {
    
    browserSync.init({
        server: "./source"
    });
    
    gulp.watch(["source/**/**.ts", "test/**/*.ts"], ["default"]);
    gulp.watch(distFolder +"/js/*.js").on('change', browserSync.reload);
    gulp.watch([
      'source/js/**',
      'source/css/**',
      'source/fonts/**',
      'source/images/**',
      'source/*.html'
  ], function(event) {
    gulp.run('copy');
  }); 
});

//******************************************************************************
//* DEFAULT
//******************************************************************************
gulp.task("default", function (cb) {
    runSequence(/*"lint",*/ "build", "copy", /*"test",*/ "bundle", cb);
});
