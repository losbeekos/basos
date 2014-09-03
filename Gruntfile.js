module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-imageoptim');
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-styleguide');

    var todayTimestamp = '<%= grunt.template.today("ddmmyyyyhhMMss") %>';

    var basosConfig = {
      src: 'src',
      dist: 'dist'
    };

    try {
        basosConfig.app = require('./bower.json').appPath || basosConfig.app;
    } catch (e) {}

    grunt.initConfig({
        basos: basosConfig,
        pkg: grunt.file.readJSON('package.json'),

        clean: ['<%= basos.dist %>'],

        copy: {
            now: {
                files: [{
                    expand: true,
                    cwd: '<%= basos.src %>/',
                    src: [
                        'js/main.js',
                        'js/vendor/**/*',
                        'fonts/**',
                        'img/**',
                        '!fonts/src/**'
                    ],
                    dest: '<%= basos.dist %>/'
                }]
            }
        },

        concat: {
            options: {
                banner: "'use strict';\n",
            },

            app: {
                src: [
                    '<%= basos.src %>/js/tests/*.js',
                    '<%= basos.src %>/js/_settings.js',
                    '<%= basos.src %>/js/helpers/*.js',
                    '<%= basos.src %>/js/modules/*.js',
                    '<%= basos.src %>/js/_init.js'
                ],
                dest: '<%= basos.dist %>/js/app.js',
            }
        },

        jshint: {
            files: [
                'Gruntfile.js',
                '<%= basos.src %>/js/*.js',
                '<%= basos.src %>/js/helpers/*.js',
                '<%= basos.src %>/js/modules/*.js',
                '<%= basos.src %>/js/tests/*.js',
                '!<%= basos.src %>/js/app.js'
            ],

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

        sass: {
            dev: {
                options: {
                    style: 'expanded',
                    require: 'susy'
                },

                files: {
                    '<%= basos.dist %>/css/main.css': '<%= basos.src %>/scss/main.scss'
                }
            }
        },

        autoprefixer: {
            dev: {
                files: {
                    '<%= basos.dist %>/css/main.css': '<%= basos.dist %>/css/main.css'
                }
            }
        },

        cssmin: {
            minify: {
                expand: true,
                cwd: '<%= basos.dist %>/css/',
                src: ['main.css', '!*.min.css'],
                dest: '<%= basos.dist %>/css/',
                ext: '.'+todayTimestamp+'.min.css'
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
                        cwd: '<%= basos.dist %>/js/',
                        src: ['main.js', 'app.js'],
                        dest: '<%= basos.dist %>/js/',
                        ext: '.'+todayTimestamp+'.min.js',
                        extDot: 'first'
                    },
                ]
            },

            vendor: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= basos.dist %>/js/vendor/',
                        src: ['modernizr/modernizr.js',],
                        dest: '<%= basos.dist %>/js/vendor',
                        ext: '.'+todayTimestamp+'.min.js',
                        extDot: 'first'
                    },
                ]
            },
        },

        imagemin: {
            default: {
                options: {
                    optimizationLevel: 3,
                    progressive: true //jpg only
                },

                files: [{
                    expand: true,
                    cwd: '<%= basos.dist %>/img/',
                    src: ['**/*.{png,jpg,gif}'],
                    dest: '<%= basos.dist %>/img/'
                }]
            }
        },

        imageoptim: {
            options: {
                jpegMini: false,
                imageAlpha: true,
            },

            src: ['<%= basos.dist %>/img', '<%= basos.dist %>/img']
        },

        watch: {
            options: {
                livereload: true,
            },

            files: [
                '<%= jshint.files %>',
                '<%= basos.src %>/scss/**/*.scss',
                '**/*.tpl',
                '**/*.php',
                '**/*.html',
                '!docs/**/*.html'
            ],

            tasks: [
                'jshint',
                'clean',
                'concat',
                'copy',
                'sass:dev',
                'autoprefixer:dev',
                'styleguide:dev'
            ]
        },

        styleguide: {
            dev: {
                files: {
                    'docs/scss': '<%= basos.src %>/scss/**/*.scss'
                }
            }
        }

    });

    grunt.registerTask('dev', [
        'jshint',
        'clean',
        'concat',
        'copy',
        'sass:dev',
        'autoprefixer:dev',
        'styleguide:dev'
    ]);

    grunt.registerTask('dist', [
        'jshint',
        'clean',
        'concat',
        'copy',
        'sass:dev',
        'autoprefixer:dev',
        'cssmin',
        'uglify',
        'imagemin',
        'imageoptim',
        'styleguide:dev'
    ]);

    grunt.registerTask('default', ['dev', 'watch']);

};