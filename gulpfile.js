const { src, dest, series, watch, parallel } = require("gulp");
const pug = require("gulp-pug");
const webp = require("gulp-webp");
const sass = require("gulp-sass")(require("sass"));
const del = require("del");
const sync = require("browser-sync").create();
const autoprefixer = require("gulp-autoprefixer");
const stripCssComments = require("gulp-strip-css-comments");
const ttfToWoff = require("gulp-ttf-to-woff");
const sitemap = require("gulp-sitemap");
const save = require("gulp-save");

const srcDir = "./src";
const distDir = "./dist";
const siteUri = "http://localhost:8080";

const views = () => {
  return src(`${srcDir}/views/*.pug`)
    .pipe(pug({ pretty: true }))
    .pipe(save("before-sitemap"))
    .pipe(sitemap({ siteUrl: siteUri }))
    .pipe(dest(distDir))
    .pipe(save.restore("before-sitemap"))
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
  return src(`${srcDir}/js/**/*.js`).pipe(dest(`${distDir}/js`));
};

const images = () => {
  return src(`${srcDir}/img/*.{jpg,png}`)
    .pipe(dest(`${distDir}/img`))
    .pipe(webp({ quality: 90 }))
    .pipe(dest(`${distDir}/img`));
};

const vectors = () => {
  return src(`${srcDir}/img/*.svg`)
    .pipe(dest(`${distDir}/img`))
    .pipe(dest(`${distDir}/img`));
};

const fonts = () => {
  return src(`${srcDir}/fonts/*.ttf`)
    .pipe(ttfToWoff())
    .pipe(dest(`${distDir}/fonts`));
};

const robots = () => {
  return src(`${srcDir}/robots.txt`).pipe(dest(`${distDir}`));
};

const server = () => {
  sync.init({
    server: distDir,
    port: 8080,
    online: false,
    tunnel: false
  });

  watch(`${srcDir}/views/**/*.pug`, series(views)).on("change", sync.reload);
  watch(`${srcDir}/scss/**/*.scss`, series(styles)).on("change", sync.reload);
  watch(`${srcDir}/js/**/*.js`, series(scripts)).on("change", sync.reload);
  watch(`${srcDir}/img/**/*.{jpg,png}`, series(images)).on(
    "change",
    sync.reload
  );
  watch(`${srcDir}/img/**/*.svg`, series(vectors)).on("change", sync.reload);
  watch(`${srcDir}/fonts/*.ttf`, series(fonts)).on("change", sync.reload);
  watch(`${srcDir}/robots.txt`, series(robots)).on("change", sync.reload);
};

const compilingProcess = series(
  parallel(styles, scripts, images, fonts, vectors, robots),
  views
);

exports.serve = series(clear, compilingProcess, server);

exports.build = series(clear, compilingProcess);
