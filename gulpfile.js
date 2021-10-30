const { src, dest, series, watch, parallel } = require("gulp");
const pug = require("gulp-pug");
const webp = require("gulp-webp");
const sass = require("gulp-sass")(require("sass"));
const del = require("del");
const sync = require("browser-sync").create();
const autoprefixer = require("gulp-autoprefixer");
const stripCssComments = require("gulp-strip-css-comments");
const ttfToWoff = require("gulp-ttf-to-woff");

const srcDir = "./src";
const distDir = "./dist";

const views = () => {
  return src(`${srcDir}/views/*.pug`)
    .pipe(pug({ pretty: true }))
    .pipe(dest(distDir));
};

const styles = () => {
  return src(`${srcDir}/scss/style.scss`)
    .pipe(sass({ outputStyle: "compressed" }).on("error", sass.logError))
    .pipe(autoprefixer({ overrideBrowserslist: ["last 5 versions"] }))
    .pipe(stripCssComments())
    .pipe(dest(`${distDir}/css`));
};

const clear = () => {
  return del(`${distDir}`);
};

const scripts = () => {
  return src(`${srcDir}/js/*.js`).pipe(dest(`${distDir}/js`));
};

const images = () => {
  return src(`${srcDir}/img/*.{jpg, png}`)
    .pipe(dest(`${distDir}/img`))
    .pipe(webp())
    .pipe(dest(`${distDir}/img`));
};

const fonts = () => {
  return src(`${srcDir}/fonts/*.ttf`)
    .pipe(ttfToWoff())
    .pipe(dest(`${distDir}/fonts`));
};

const server = () => {
  sync.init({
    server: distDir,
    port: 8080,
    online: false,
    tunnel: false
  });

  watch(`${srcDir}/views/*.pug`, series(views)).on("change", sync.reload);
  watch(`${srcDir}/scss/style.scss`, series(styles)).on("change", sync.reload);
  watch(`${srcDir}/js/*.js`, series(scripts)).on("change", sync.reload);
  watch(`${srcDir}/img/*.{jpg, png}`, series(images)).on("change", sync.reload);
};

const compilingProcess = series(parallel(styles, scripts, images, fonts), views);

exports.serve = series(clear, compilingProcess, server);

exports.build = series(clear, compilingProcess);
