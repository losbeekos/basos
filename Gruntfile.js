module.exports = function(grunt) {

    var todayTimestamp = '<%= grunt.template.today("ddmmyyyyhhMMss") %>';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concat: {
            options: {
                banner: "'use strict';\n",
            },

            app: {
                src: ['src/js/_settings.js', 'src/js/helpers/*.js', 'src/js/modules/*.js', 'src/js/_init.js'],
                dest: 'src/js/app.js',
            }
        },

        jshint: {
            files: ['Gruntfile.js', 'src/js/*.js', 'src/js/helpers/*.js', 'src/js/modules/*.js', '!src/js/*.*.min.js'],
            options: {
                expr: true,
                node: true,
                browser: true,
                esnext: true,
                camelcase: false,
                curly: true,
                eqeqeq: true,
                immed: true,
                indent: 4,
                latedef: true,
                newcap: true,
                noarg: true,
                regexp: true,
                undef: false,
                unused: false,
                strict: false,
                trailing: true,
                smarttabs: true,
                globals: {
                    app: true,
                    helper: true,
                    document: true,
                    window: true,
                    yepnope: true,
                    FastClick: true,
                    Modernizr: true,
                    url: true,
                    $: false,
                    jQuery: false,
                    console: true,
                    module: true
                }
            }
        },

        uglify: {
            options: {
                compress: {
                    drop_console: true
                }
            },

            js: {
                files: [
                    {
                        expand: true,
                        cwd: 'dist/js/',
                        src: ['main.js', 'app.js'],
                        dest: 'dist/js/',
                        ext: '.'+todayTimestamp+'.min.js',
                        extDot: 'first'
                    },
                ]
            },

            bower: {
                files: [
                    {
                        expand: true,
                        cwd: 'src/bower_components/',
                        src: ['**/*.js', '!jquery/src/*.js', '!parsleyjs/src/wrap/*.js'],
                        dest: 'dist/bower_components/',
                        ext: '.js',
                        extDot: 'last'
                    },
                ]
            },

            vendor: {
                files: [
                    {
                        expand: true,
                        cwd: 'src/js/vendor/',
                        src: ['modernizr/modernizr.js',],
                        dest: 'dist/js/vendor',
                        ext: '.'+todayTimestamp+'.min.js',
                        extDot: 'first'
                    },
                ]
            },
        },

        autoprefixer: {
            dev: {
                files: {
                    'src/css/main.css': 'src/css/main.css'
                }
            },

            dist: {
                files: {
                    'dist/css/main.css': 'dist/css/main.css'
                }
            }
        },

        sass: {
            dev: {
                options: {
                    style: 'expanded',
                    require: 'susy'
                },

                files: {
                    'src/css/main.css': 'src/scss/main.scss'
                }
            },

            dist: {
                options: {
                    style: 'expanded',
                    require: 'susy'
                },

                files: {
                    'dist/css/main.css': 'src/scss/main.scss'
                }
            }
        },

        cssmin: {
            minify: {
                expand: true,
                cwd: 'dist/css/',
                src: ['main.css', '!*.min.css'],
                dest: 'dist/css/',
                ext: '.'+todayTimestamp+'.min.css'
            }
        },

        imagemin: {
            default: {
                options: {
                    optimizationLevel: 3,
                    progressive: true //jpg only
                },

                files: [{
                    expand: true,
                    cwd: 'dist/img/',
                    src: ['**/*.{png,jpg,gif}'],
                    dest: 'dist/img/'
                }]
            }
        },

        imageoptim: {
            options: {
                jpegMini: false,
                imageAlpha: true,
            },

            src: ['dist/img', 'dist/img']
        },

        watch: {
            options: {
                livereload: true,
            },

            files: ['<%= jshint.files %>', 'src/scss/**/*.scss', '**/*.tpl', '**/*.php', '**/*.html'],

            tasks: [
                'concat',
                'jshint',
                'sass:dev',
                'autoprefixer:dev'
            ]
        },

        copy: {
            dist: {
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: ['js/main.js', 'fonts/**', 'img/**'],
                    dest: 'dist/'
                }]
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-imageoptim');
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-contrib-copy');

    // To buggy:
    //grunt.loadNpmTasks('grunt-combine-media-queries');


    grunt.registerTask('default', [
        'concat',
        'jshint',
        'sass:dev',
        'autoprefixer:dev'
    ]);

    grunt.registerTask('dev', [
        'concat',
        'jshint',
        'sass:dev',
        'autoprefixer:dev'
    ]);

    grunt.registerTask('dist', [
        'concat',
        'jshint',
        'copy:dist',
        'sass:dist',
        'autoprefixer:dist',
        'cssmin',
        'uglify',
        'imagemin',
        'imageoptim'
    ]);

};