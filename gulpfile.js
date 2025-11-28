const { src, dest, parallel, series, watch } = require("gulp");
const del = require("del");
const imagemin = require("gulp-imagemin");
const sass = require("gulp-sass")(require("sass"));
const gcssmq = require("gulp-group-css-media-queries");
const includeFiles = require("gulp-include");
const browserSync = require("browser-sync").create();

function browsersync() {
    browserSync.init({
        server: {
            baseDir: "./public/",
            serveStaticOptions: {
                extensions: ["html"],
            },
        },
        port: 8080,
        ui: { port: 8081 },
        open: true,
    });
}

function styles() {
    return src("./src/styles/style.scss")
        .pipe(sass().on("error", sass.logError))
        .pipe(gcssmq())
        .pipe(dest("./public/css/"))
        .pipe(browserSync.stream());
}

function thirdPartyStyles() {
    return src("./src/styles/**.css")
        .pipe(dest("./public/css/"))
        .pipe(browserSync.stream());
}

function scripts() {
    return src("./src/js/**.js")
        .pipe(
            includeFiles({
                includePaths: "./src/components/**/",
            })
        )
        .pipe(dest("./public/js/"))
        .pipe(browserSync.stream());
}

function pages() {
    return src("./src/pages/*.html")
        .pipe(
            includeFiles({
                includePaths: "./src/components/**/",
            })
        )
        .pipe(dest("./public/"))
        .pipe(browserSync.reload({ stream: true }));
}

function copyFonts() {
    return src("./src/fonts/**/*").pipe(dest("./public/fonts/"));
}

function copyImages() {
    return src("./src/images/**/*").pipe(dest("./public/images/"));
}

async function copyResources() {
    copyFonts();
    copyImages();
}

async function clean() {
    return del.sync("./public/", { force: true });
}

function watch_dev() {
    watch(["./src/styles/*.css"], thirdPartyStyles);
    watch(["./src/js/script.js", "./src/components/**/*.js"], scripts);
    watch(
        [
            "./src/styles/*.scss",
            "./src/styles/**/*.scss",
            "./src/components/**/*.scss",
        ],
        styles
    ).on("change", browserSync.reload);
    watch(["./src/pages/*.html", "./src/components/**/*.html"], pages).on(
        "change",
        browserSync.reload
    );
    watch(["./src/images/*", "./src/images/**/*"], copyImages).on(
        "change",
        browserSync.reload
    );
}

exports.browsersync = browsersync;
exports.clean = clean;
exports.scripts = scripts;
exports.styles = styles;
exports.thirdPartyStyles = thirdPartyStyles;
exports.pages = pages;
exports.copyResources = copyResources;

exports.default = parallel(
    clean,
    styles,
    thirdPartyStyles,
    scripts,
    copyResources,
    pages,
    browsersync,
    watch_dev
);

exports.build = series(
    clean,
    styles,
    thirdPartyStyles,
    scripts,
    copyResources,
    pages
);