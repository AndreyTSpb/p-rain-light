/**
 * browsersync - синхронизация изменений файлах с браузером
 * npm i browser-sync --save-dev
 * 
 * file include - сборка html файла из инклюдов
 * npm i gulp-file-include --save-dev
 * 
 * del - удаленеи файлов из папки
 * npm i del --save-dev
 * 
 * sass и gulp-sass - конвертация sass|scss в css
 * npm i sass gulp-sass --save-dev 
 * 
 * gulp-autoprefixer - 
 * npm i gulp-autoprefixer --save-dev
 * 
 * gulp-group-css-media-queries - группирует медиа запросы и ставит в конец файла
 * npm i gulp-group-css-media-queries --save-dev
 * 
 * gulp-clean-css
 * npm i gulp-clean-css --save-dev
 * 
 * gulp-rename
 * npm i --save-dev gulp-rename
 * 
 * gulp-babel -  преобразование JS для старых браузеров  
 * npm i --save-dev gulp-babel @babel/core @babel/preset-env
 * 
 * 
 * */

 const del = require('del');

 let project_folder = "dist",
     source_folder  = "src";
 
 let path = {
     build: {
         html: project_folder + "/",
         css: project_folder + "/css/",
         js: project_folder + "/js/",
         img: project_folder + "/img/",
         fonts: project_folder + "/fonts/"
     },
     src: {
         html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
         css: source_folder + "/scss/style.scss",
         js: source_folder + "/js/script.js",
         img: source_folder + "/img/**/*.{jpg,png,svg,ico,webp,gif}",
         fonts: source_folder + "/fonts/*.{ttf,eot,woff}"
     },
     watch: {
         html: source_folder + "/**/*.html",
         css: source_folder + "/scss/**/*.scss",
         js: source_folder + "/js/**/*.js",
         img: source_folder + "/img/**/*.{jpg,png,svg,ico,webp,gif}",
     },
     clean:"./" + project_folder + "/"
 }
 
 let {src, dest}  = require('gulp'),
     gulp         = require('gulp'),
     browsersync  = require('browser-sync').create(),
     fileInclude  = require('gulp-file-include'),
     fileDel      = require('del'),
     sass         = require('gulp-sass')(require('sass')),
     autoprefixer = require('gulp-autoprefixer'),
     group_media  = require('gulp-group-css-media-queries'),
     clean_css    = require('gulp-clean-css'),
     gulp_rename  = require('gulp-rename'),
     babel        = require('gulp-babel');
 
 function browserSync(params){
     browsersync.init({
         server: {
             baseDir: "./" + project_folder + "/"
         },
         port:3000,
         notify: false
     });
 }
 
 /**
  * Обьединение html и перенос в папку dist
  * @returns 
  */
 function html() {
     return src(path.src.html)
         .pipe(fileInclude())
         .pipe(dest(path.build.html))
         .pipe(browsersync.stream());
 }
 
 /**
  * Конвертация  scss и перенос всего в папку dist
  * @returns 
  */
 function css(){
     return src(path.src.css)
         .pipe(
             sass({
                 outputStyle: "expanded" 
             }).on('error',sass.logError)
         )
         .pipe(
             group_media()
         )
         .pipe(
             autoprefixer({
                 overrideBrowserslist: ["last 5 versions"],
                 cascade: true
             })
         )
         .pipe(dest(path.build.css))
         .pipe(clean_css())
         .pipe(
             gulp_rename({
                 extname: ".min.css"
             })
         )
         .pipe(dest(path.build.css))
         .pipe(browsersync.stream());
 }
 
 /**
  * Обьединение js и перенос в папку dist
  * @returns 
  */
  function js() {
     return src(path.src.js)
         .pipe(fileInclude())
         .pipe(babel({
             presets: ['@babel/env']
         }))
         .pipe(dest(path.build.js))
         .pipe(browsersync.stream());
 }
 
 /**
  * ПЕренос картинок ( без сжатий ) и перенос в папку dist
  * @returns 
  */
 function img() {
     return src(path.src.img)
         .pipe(dest(path.build.img))
         .pipe(browsersync.stream());
 }
 
 function fonts() {
     return src(path.src.fonts)
         .pipe(dest(path.build.fonts))
         .pipe(browsersync.stream());
 }
 
 /**
  * Следим за изменением файлов html, css, js
  * @param {*} params 
  */
 function watchFiles(params){
     gulp.watch([path.watch.html], html);
     gulp.watch([path.watch.css], css);
     gulp.watch([path.watch.js], js);
     gulp.watch([path.watch.img], img);
 }
 /**
  * Очистка папки Dist
  * @param {*} params 
  * @returns 
  */
 function cleanDist(params){
     return del(path.clean);
 }
 
 let build = gulp.series(cleanDist, gulp.parallel(css, js, html, img, fonts));
 let watch = gulp.parallel(build, watchFiles, browserSync);
 
 exports.css   = css;
 exports.js    = js;
 exports.html  = html;
 exports.img   = img;
 exports.fonts = fonts;
 exports.build = build;
 exports.watch = watch;
 exports.default = watch;