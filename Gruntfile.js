
var peanuts = false,
    minifyExt,
    todayTimestamp = '<%= grunt.template.today("ddmmyyyyhhMMss") %>';

function config(name) {
    return require('./tasks/' + name + '.js');
}

if (peanuts === true) {
    minifyExt = {
        css: '.css',
        js: '.js'
    };
} else {
    minifyExt = {
        css: '.'+todayTimestamp+'.min.css',
        js: '.'+todayTimestamp+'.min.js'
    };
}

module.exports = function(grunt) {

    require('jit-grunt')(grunt); //load all grunt tasks matching the `grunt-*` pattern
    require('time-grunt')(grunt);

    var gateway = require('gateway');

    grunt.initConfig({
        basos: {
            src     : 'assets/src',
            dist    : 'assets/dist'
        },
        minifyExt   : minifyExt,
        pkg         : grunt.file.readJSON('package.json'),
        clean       : config('clean'),
        copy        : config('copy'),
        concat      : config('concat'),
        jshint      : config('jshint'),
        sass        : config('sass'),
        postcss     : config('postcss'),
        cssmin      : config('cssmin'),
        uglify      : config('uglify'),
        imagemin    : config('imagemin'),
        imageoptim  : config('imageoptim'),
        watch       : config('watch'),
        connect     : config('connect'),
        browserSync : config('browserSync'),
        hologram    : config('hologram'),
        css_wrap    : config('cssWrap'),
        modernizr   : config('modernizr'),
        svg_sprite  : config('svgSprite')
    });

    if (peanuts === true) {
        grunt.registerTask('dev',  [ 'jshint', 'clean', 'concat', 'copy', 'sass:dev', 'postcss', 'css_wrap', 'svg_sprite' ]);
        grunt.registerTask('dist', [ 'jshint', 'clean', 'concat', 'copy', 'sass:dev', 'postcss', 'cssmin', 'uglify', 'css_wrap', 'svg_sprite' ]);
    } else {
        grunt.registerTask('dev',  [ 'jshint', 'clean', 'concat', 'copy', 'sass:dev', 'postcss', 'modernizr', 'svg_sprite' ]);
        grunt.registerTask('dist', [ 'jshint', 'clean', 'concat', 'copy', 'sass:dev', 'postcss', 'cssmin', 'modernizr', 'uglify', 'imagemin', 'imageoptim', 'svg_sprite' ]);
    }

    grunt.registerTask('docs',    [ 'hologram', 'clean:docs' ]);
    grunt.registerTask('default', [ 'dev', 'watch' ]);

};

