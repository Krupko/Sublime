const { src, dest, parallel, series, watch } = require("gulp");
const cli = require("gulp-cli");
const sass = require("gulp-sass");
const autoprefixer = require("gulp-autoprefixer");
const rename = require("gulp-rename");
const sourcemaps = require("gulp-sourcemaps");
const cleanCSS = require("gulp-clean-css");
const browserSync = require("browser-sync").create();
const fileinclude = require("gulp-file-include");
const ttf2woff = require("gulp-ttf2woff");
const ttf2woff2 = require("gulp-ttf2woff2");
const svgSprite = require("gulp-svg-sprite");

const del = require("del");

const fonts = () => {
  src("./src/fonts/**.ttf").pipe(ttf2woff()).pipe(dest("./app/fonts/"));
  return src("./src/fonts/**.ttf").pipe(ttf2woff2()).pipe(dest("./app/fonts/"));
};

const svgSprites = () => {
  return src("./src/img/svg/**.svg")
    .pipe(
      svgSprite({
        mode: {
          stack: {
            sprite: "../sprite.svg",
          },
        },
      })
    )
    .pipe(dest("./app/img"));
};

//sourcemap, rename, autoprefixer, cleanCSS, browser-sync
const styles = () => {
  return (
    src("./src/scss/**/*.scss")
      .pipe(sourcemaps.init())
      .pipe(
        sass({
          outputStyle: "expanded",
        }).on("error", sass.logError)
      )
      .pipe(
        rename({
          suffix: ".min",
        })
      )
      .pipe(
        autoprefixer({
          cascade: true,
          overrideBrowserslist: ["last 5 version"],
        })
      )
      // .pipe(cleanCSS({
      // 	livel: 2
      // }))
      .pipe(sourcemaps.write("."))
      .pipe(dest("./app/css/"))
      .pipe(browserSync.stream())
  );
};

const htmlInclude = () => {
  return src(["./src/index.html"])
    .pipe(
      fileinclude({
        prefix: "@@",
        basepath: "@file",
      })
    )
    .pipe(dest("./app"))
    .pipe(browserSync.stream());
};

const imgToApp = () => {
  return src([
    "./src/img/**.jpg",
    "./src/img/**.png",
    "./src/img/**.jpeg",
  ]).pipe(dest("./app/img"));
};

const resources = () => {
  return src("./src/resources/**").pipe(dest("./app/resources"));
};

const js = () => {
  return src("./src/js/**").pipe(dest("./app/js"));
};

const clean = () => {
  return del(["app/*"]);
};

const watchFiles = () => {
  browserSync.init({
    server: {
      baseDir: "./app",
    },
  });

  watch("./src/scss/**/*.scss", styles);
  watch("./src/index.html", htmlInclude);
  watch("./src/img/**.jpg", imgToApp);
  watch("./src/img/**.png", imgToApp);
  watch("./src/img/**.jpeg", imgToApp);

  watch("./src/resources/**", resources);
  watch("./src/fonts/**.ttf", fonts);
  watch("./src/js/**", js);
  watch("./src/img/svg/**.svg", svgSprites);
};

exports.styles = styles;
exports.watchFiles = watchFiles;
exports.filesinclude = htmlInclude;

exports.default = series(
  clean,
  parallel(htmlInclude, fonts, resources, js, imgToApp, svgSprites),
  styles,
  watchFiles
);
