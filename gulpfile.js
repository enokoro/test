var gulp = require('gulp');
var browserSync = require('browser-sync');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');
var csscomb = require('gulp-csscomb');
var notify  = require('gulp-notify');
var autoprefixer = require('gulp-autoprefixer');
var rename = require('gulp-rename');
var watch = require('gulp-watch');
var cache = require('gulp-cached');
var pug = require('gulp-pug');

//var destDir = 'inu/public_html/'; // 出力用ディレクトリ
//var devlDir = 'inu/resource/'; // 開発用ディレクトリ
var destDir = 'sns/public_html/'; // 出力用ディレクトリ
var devlDir = 'sns/resource/'; // 開発用ディレクトリ

gulp.task('browser-sync', function() {
	browserSync({
		server: {baseDir: destDir}
	});
});

gulp.task('pug', function(){
	return gulp.src([devlDir + '**/*.pug', '!' + devlDir + '**/_*.pug'])
	.pipe(pug({
		pretty: true
	}))
	.pipe(gulp.dest(devlDir));
});

gulp.task('sass', function () {
	return gulp.src([devlDir + '**/scss/*.scss'])
		.pipe(plumber({ // gulp-plumberを咬ますとエラー時にgulpが止まらない。
		 errorHandler: notify.onError('Error: <%= error.message %>') // gulp-notifyでエラー通知を表示
		}))
		.pipe(sass()) // gulp-sassでコンパイルし、
		.pipe(autoprefixer({ browsers: ['last 2 versions', 'Android 3', 'ie 9'] })) // autoprefixerかけて、（対応ブラウザ。案件によって変更する）
		.pipe(csscomb()) // gulp-csscombで整形してあげて、
		.pipe(rename(function(path){
			path.dirname = path.dirname.replace( 'scss', 'css'); // sass→cssに
		}))
		.pipe(gulp.dest(devlDir)) // とりあえずresource側cssフォルダに吐き出す。
});

gulp.task( 'css',function() {
		return gulp.src(devlDir + '**/*.css')
		.pipe( cache('css-cache')) // cssをキャッシュさせつつ、
		.pipe( gulp.dest( destDir )) // destDirに出力して、
		.pipe( browserSync.stream()) // browser-syncで反映させる。
});

gulp.task( 'copyResource',function() {
		return gulp.src([
			devlDir + '**/*',
			'!' + devlDir + '_*.html',
			'!' + devlDir + '**/scss/',
			'!' + devlDir + '**/*.pug',
			'!' + devlDir + 'template/'
		]) // sassディレクトリ以外の全ファイルを対象にし、
		.pipe( cache('resource-cache')) // キャッシュさせて、
		.pipe( gulp.dest( destDir )) // destDirに出力して、
		.pipe( browserSync.stream()) // browser-syncで反映させる。
});

// gulp-watchで監視
gulp.task('default',['browser-sync','copyResource','sass'],function(){
		watch([devlDir + '**/*.pug'], function(event){
				gulp.start(['pug']); // pugに変更があったら実行。
		});
		watch([devlDir + '**/*.+(jpg|jpeg|gif|png|html|js|php)'], function(event){
				gulp.start(['copyResource']); // css,sass,js以外に変更があったら実行。
		});
		watch([devlDir + '**/*.scss'], function(event){
				gulp.start(['scss']); // scssに変更があったら実行。cssを吐き出すので下のwatchが動く。
		});
		watch([devlDir + '**/*.css'], function(event){
				gulp.start(['css']); // cssに変更があったら実行。つまりsassを変更したらセットで実行となる。
		});
});
