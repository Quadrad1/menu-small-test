'use strict';
var gulp = require('gulp'),
    //var smartgrid = require('smart-grid');
    watch = require('gulp-watch'),
    pug = require('gulp-pug'),
    prefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    cssmin = require('gulp-cssmin'),
    sass = require('gulp-sass'),
    sassLint = require('gulp-sass-lint'),
    // sourcemaps = require('gulp-sourcemapssourcemaps'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    spritesmith = require("gulp.spritesmith"),
    svgstore = require('gulp-svgstore'),
    svgmin = require('gulp-svgmin'),
    inject = require('gulp-inject'),
    rename = require('gulp-rename'),
    plumber = require('gulp-plumber'),
    notify = require("gulp-notify"),
    rigger = require("gulp-rigger"),
    browserSync = require('browser-sync').create();

var path = {
    build: {
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/images/',
        fonts: 'build/fonts/'
    },
    src: {
        pug: 'src/*.pug',
        mainJs: 'src/js/*.js',
        js: 'src/js/*.js',
        style: 'src/scss/*.sass',
        img: 'src/images/**/*.*',
        pngSprite: 'src/sprite/png/',
        svgSprite: 'src/sprite/svg/**/*.svg',
        fonts: 'src/fonts/**/*.*'
    },
    watch: {
        pug: 'src/**/*.pug',
        mainJs: 'src/js/**/main.js',
        partialsJs: 'src/js/partials/**/*.js',
        js: 'src/js/**/vendors.js',
        style: 'src/scss/**/*.scss',
        img: 'src/images/**/*.*',
        pngSprite: 'src/sprite/png/*.png',
        svgSprite: 'src/sprite/svg/**/*.svg',
        fonts: 'src/fonts/**/*.*'
    },
    clean: './build'
};

gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "./build"
        }
    });
});

gulp.task('html:build', function () {
    gulp.src(path.src.pug)
        .pipe(pug({
            pretty: true
        }))
        .pipe(gulp.dest(path.build.html))
        .pipe(browserSync.stream());
});

gulp.task('mainJs:build', function () {
    gulp.src(path.src.mainJs)
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(rigger())
        .pipe(gulp.dest(path.build.js))
        .pipe(browserSync.stream());
});

gulp.task('js:build', function () {
    gulp.src(path.src.js)
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(rigger())
        .pipe(gulp.dest(path.build.js))
        .pipe(browserSync.stream());
});

gulp.task('style:build', function () {
    gulp.src(path.src.style)
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        //.pipe(sourcemaps.init())
        .pipe(sass({errLogToConsole: true}))
        .pipe(prefixer())
        .pipe(cssmin())
        //.pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.css))
        .pipe(browserSync.stream());
});

gulp.task('sassLint', function () {
    return gulp.src('src/sass/**/*.s+(a|c)ss')
        .pipe(sassLint())
        .pipe(sassLint.format())
        .pipe(sassLint.failOnError())
});

gulp.task('image:build', function () {
    gulp.src(path.src.img)
        // .pipe(imagemin({
        //     progressive: true,
        //     svgoPlugins: [{removeViewBox: false}],
        //     use: [pngquant()],
        //     interlaced: true
        // }))
        .pipe(gulp.dest(path.build.img))
        .pipe(browserSync.stream());
});

gulp.task('fonts:build', function () {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

// PNG Sprites
gulp.task('png-sprite', function () {
    var spriteData =
        gulp.src(path.src.pngSprite + '*.png')
            .pipe(spritesmith({
              retinaSrcFilter: path.src.pngSprite + '*-2x.png',
              imgName: 'sprite.png',
              retinaImgName: 'sprite-2x.png',
              cssName: '_png-sprite.sass',
              cssTemplate: 'sass.template.mustache',
              cssVarMap: function (sprite) {
                sprite.name = sprite.name;
                sprite.image2x = 'sprite-2x.png';
              }
            }));

    spriteData.img.pipe(gulp.dest('src/images/'));
    spriteData.css.pipe(gulp.dest('src/sass/'));
});

// SVG Sprites
gulp.task('svg-sprite', function () {

    var svgs = gulp
        .src(path.src.svgSprite)
        .pipe(rename({prefix: 'svg-icon-'}))
        .pipe(svgmin())
        .pipe(svgstore({ inlineSvg: true }));

    function fileContents (filePath, file) {
        return file.contents.toString();
    }

    return gulp
        .src('src/pug/svg.pug')
        .pipe(inject(svgs, { transform: fileContents }))
        .pipe(gulp.dest('src/pug'));

});

gulp.task('build', [
    'html:build',
    'mainJs:build',
    'js:build',
    'style:build',
    'fonts:build',
    'image:build',
    'png-sprite',
    'svg-sprite'
]);

gulp.task('watch', function () {
    watch([path.watch.pug], function (event, cb) {
        gulp.start('html:build');
    });
    watch([path.watch.style], function (event, cb) {
        gulp.start('style:build');
    });
    watch([path.watch.mainJs, path.watch.partialsJs], function (event, cb) {
        gulp.start('mainJs:build');
    });
    watch([path.watch.js], function (event, cb) {
        gulp.start('js:build');
    });
    watch([path.watch.img], function (event, cb) {
        gulp.start('image:build');
    });
    watch([path.watch.pngSprite], function (event, cb) {
        gulp.start('png-sprite');
    });
    watch([path.watch.svgSprite], function (event, cb) {
        gulp.start('svg-sprite');
    });
    watch([path.watch.fonts], function (event, cb) {
        gulp.start('fonts:build');
    });
});

gulp.task('default', ['build', 'browser-sync', 'watch']);

/*
var settings = {
    outputStyle: 'less', // less || scss || sass || styl 
    columns: 12, // number of grid columns 
    offset: '30px', // gutter width px || % 
    mobileFirst: false, // mobileFirst ? 'min-width' : 'max-width'
    container: {
        maxWidth: '1200px', // max-width оn very large screen 
        fields: '30px' // side fields 
    },
    breakPoints: {
        lg: {
            width: '1100px', // -> @media (max-width: 1100px) 
        },
        md: {
            width: '960px'
        },
        sm: {
            width: '780px',
            fields: '15px' // set fields only if you want to change container.fields 
        xs: {
            width: '560px'
        }
        
        We can create any quantity of break points.
 
        some_name: {
            width: 'Npx',
            fields: 'N(px|%|rem)',
            offset: 'N(px|%|rem)'
        }
        
    }
};
 
smartgrid('./path-to-your-folder', settings);*/