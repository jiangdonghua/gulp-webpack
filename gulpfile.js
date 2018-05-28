/**
 * Gulpfile for project
 * created by dh
 */

// 载入外挂
var gulp = require('gulp'),
    // sass = require('gulp-ruby-sass'),
    less = require('gulp-less'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    clean = require('gulp-clean'),
    order = require("gulp-order"),
    // spriter = require('gulp-css-spriter'),
    // base64 = require('gulp-css-base64'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    browserSync = require('browser-sync').create(),
    webpack = require('gulp-webpack'),
    fileinclude = require('gulp-file-include'),
    runSequence = require('run-sequence');


// 样式  return stream以保证browserSync.reload在正确的时机调用
gulp.task('styles', function () {
    gulp.src(['./src/assets/css/*.css', './src/lib/css/*.css'])
        .pipe(gulp.dest('./dist/css'))
        .pipe(rename({suffix: '.min'}))
        .pipe(minifycss())
        .pipe(gulp.dest('./dist/css'))
        .pipe(browserSync.stream())
        .pipe(notify({message: 'Styles task complete'}));
    return gulp.src('./src/assets/css/*.less')
        .pipe(less())
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(gulp.dest('./dist/css'))
        .pipe(rename({suffix: '.min'}))
        .pipe(minifycss())
        .pipe(gulp.dest('./dist/css'))
        .pipe(browserSync.stream())
        .pipe(notify({message: 'Styles task complete'}));
});

// 脚本
gulp.task('scripts', function (callback) {
    return gulp.src(['./src/assets/js/*.js', './src/lib/js/*.js'])
        .pipe(webpack(require('./webpack.config.js')))
        .pipe(gulp.dest('./dist/js'))
        .pipe(browserSync.stream());
});
gulp.task('thirdPartyJs', function () {
    return gulp.src(['./src/lib/js/*.js'])
        .pipe(order([
            "src/lib/js/jquery-1.8.2.js",
            "src/lib/js/bootstrap.js",
            "src/lib/js/*.js"
        ]))
        .pipe(jshint('.jshintrc'))
        // .pipe(jshint.reporter('default'))
        // .pipe(concat('main.js'))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(gulp.dest('./dist/js/lib'))
        .pipe(notify({message: 'Scripts task complete'}));
});

// 图片
gulp.task('images', function () {
    return gulp.src('./src/assets/images/**/*')
        .pipe(cache(imagemin({optimizationLevel: 3, progressive: true, interlaced: true})))
        .pipe(gulp.dest('./dist/images'))
        .pipe(browserSync.stream())
        .pipe(notify({message: 'Images task complete'}));
});
//html
gulp.task('html', function () {
    return gulp.src('./src/views/**/*.html')
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest('dist'))
        .pipe(browserSync.stream())
        .pipe(notify({message: 'html task complete'}));
});
// 清理
gulp.task('clean', function () {
    return gulp.src('./dist/', {read: false})
        .pipe(clean());
});

//监控
gulp.task('watch', function () {
    // 看守所有.scss档
    gulp.watch(['./src/assets/css/**/*.less', './src/assets/css/**/*.css'], ['styles']).on('change', browserSync.reload);

    // 看守所有.js档
    gulp.watch('./src/assets/js/**/*.js', ['scripts', 'thirdPartyJs']).on('change', browserSync.reload);

    // 看守所有图片档
    gulp.watch('./src/assets/images/**/*', ['images']).on('change', browserSync.reload);

    //看守html
    gulp.watch('./src/views/**/*.html', ['html']).on('change', browserSync.reload);

    // gulp.watch(['./dist/**']).on('change', browserSync.reload);
})

//预设任务
gulp.task('default', ['serve']);


gulp.task('serve', function (callback) {
    runSequence('clean', ['styles','scripts', 'thirdPartyJs', 'images'], 'html', function () {
        browserSync.init({
            server: "./dist/"
        });
        //从这个项目的根目录启动服务器
        gulp.start('watch')
    })




});
