const gulp = require('gulp');
const babel = require('gulp-babel');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const nodemon = require('gulp-nodemon');
const concat = require('gulp-concat');

sass.compiler = require('node-sass');

const path = {
  js: 'src/client/js/*.js',
  libJs: 'src/client/lib/*.js',
  libCss: 'src/client/lib/*.css',
  libMap: 'src/client/lib/map/*.js',
  scss: ['src/client/sass/*.scss', '!src/client/sass/util.scss'],
  img: 'src/client/img/*.*',
};

gulp.task('js', () => {
  return gulp
    .src(path.js)
    .on('error', console.error.bind(console))
    .pipe(sourcemaps.init())
    .pipe(babel({ presets: ['@babel/env'] }))
    .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist/js'));
});

gulp.task('libJs', () => {
  return gulp
    .src(path.libJs)
    .on('error', console.error.bind(console))
    .pipe(concat('bundle.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'));
});

gulp.task('libMap', () => {
  return gulp
    .src(path.libMap)
    .on('error', console.error.bind(console))
    .pipe(concat('map-bundle.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'));
});

gulp.task('libCss', () => {
  return gulp
    .src(path.libCss)
    .on('error', console.error.bind(console))
    .pipe(concat('bundle.css'))
    .pipe(gulp.dest('dist/css'));
});

gulp.task('scss', () => {
  return gulp
    .src(path.scss)
    .pipe(
      sass({ includePaths: ['./src/client/sass'] }).on('error', sass.logError)
    )
    .pipe(gulp.dest('dist/css'));
});

gulp.task('img', () => {
  return gulp.src(path.img).pipe(gulp.dest('dist/img'));
});

gulp.task('default', ['js', 'libJs', 'libMap', 'libCss', 'img', 'scss']);

gulp.task('watch', ['js', 'scss', 'img'], () => {
  gulp.watch(path.js, ['js']);
  gulp.watch(path.scss, ['scss']);
  gulp.watch(path.img, ['img']);
});

gulp.task('start', ['libJs', 'libMap', 'libCss', 'watch'], () => {
  return nodemon({
    script: 'index.js',
    ignore: ['dist/*', 'src/client/*'],
  });
});
