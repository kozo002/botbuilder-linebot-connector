var gulp = require('gulp');

var watch = require('gulp-watch');

var source = './src/joke/locale',  
    destination = './dist/joke/locale';

gulp.task('default', function() {  
  gulp.src(source + '/**/*', {base: source})
    .pipe(watch(source, {base: source}))
    .pipe(gulp.dest(destination));
});
