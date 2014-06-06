module.exports = function(grunt) {

    var todayTimestamp = '<%= grunt.template.today("ddmmyyyyhhMMss") %>';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concat: {
            options: {
                banner: "'use strict';\n",
            },

            app: {
                src: ['js/_settings.js', 'js/helpers/*.js', 'js/modules/*.js', 'js/_init.js'],
                dest: 'js/app.js',
            }
        },

        jshint: {
            files: ['Gruntfile.js', 'js/*.js', 'js/helpers/*.js', 'js/modules/*.js', '!js/*.*.min.js'],
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
                        cwd: 'js/',
                        src: ['main.js', 'app.js'],
                        dest: 'js/',
                        ext: '.'+todayTimestamp+'.min.js',
                        extDot: 'first'
                    },
                ]
            },

            bower: {
                files: [
                    {
                        expand: true,
                        cwd: 'js/bower_components/',
                        src: ['**/*.js', '!jquery/src/*.js', '!parsleyjs/src/wrap/*.js'],
                        dest: 'js/components/',
                        ext: '.js',
                        extDot: 'last'
                    },
                ]
            },
        },

        autoprefixer: {
            files: {
                'css/main.css': 'css/main.css'
            }
        },

        sass: {
            dev: {
                options: {
                    style: 'expanded',
                    require: 'susy'
                },

                files: {
                    'css/main.css': 'scss/main.scss'
                }
            }
        },

        cmq: {
            options: {
                log: true
            },

            dist: {
                files: {
                    'css': ['css/main.css']
                }
            }
        },

        cssmin: {
            minify: {
                expand: true,
                cwd: 'css/',
                src: ['main.css', '!*.min.css'],
                dest: 'css/',
                ext: '.'+todayTimestamp+'.min.css'
            }
        },

        imagemin: {
            default: {
                options: {
                    optimizationLevel: 3
                },

                files: [{
                    expand: true,
                    cwd: 'img/',
                    src: ['**/*.{png,jpg,gif}'],
                    dest: 'img/'
                }]
            }
        },

        imageoptim: {
            options: {
                jpegMini: false,
                imageAlpha: true,
            },

            src: ['img', 'img']
        },

        watch: {
            files: ['<%= jshint.files %>', 'scss/**/*.scss'],
            tasks: ['concat', 'jshint', 'sass', 'cmq', 'autoprefixer']
        }

    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-combine-media-queries');
    grunt.loadNpmTasks('grunt-imageoptim');
    grunt.loadNpmTasks('grunt-autoprefixer');

    grunt.registerTask('default', ['concat', 'jshint', 'sass', 'cmq', 'autoprefixer', 'watch']);
    grunt.registerTask('dev', ['concat', 'jshint', 'sass', 'cmq', 'autoprefixer', 'watch']);
    grunt.registerTask('dist', ['concat', 'jshint', 'uglify', 'sass', 'cmq', 'autoprefixer', 'cssmin', 'imagemin', 'imageoptim']);

};