module.exports = function(grunt) {

     //load all grunt tasks matching the `grunt-*` pattern
    require('load-grunt-tasks')(grunt);

    var todayTimestamp = '<%= grunt.template.today("ddmmyyyyhhMMss") %>',
        basosConfig = {
            src: 'assets/src',
            dist: 'assets/dist'
        },
        gateway = require('gateway');

    grunt.initConfig({
        basos: basosConfig,
        pkg: grunt.file.readJSON('package.json'),

        clean: {
            js: ['<%= basos.dist %>/js'],
            tempsass: ['<%= basos.dist %>/css/temp.*'],
            fonts: ['<%= basos.dist %>/fonts'],
            images: ['<%= basos.dist %>/img']
        },

        copy: {
            js: {
                files: [{
                    expand: true,
                    cwd: '<%= basos.src %>/',
                    src: [
                        'js/main.js',
                        'js/vendor/**/*',
                    ],
                    dest: '<%= basos.dist %>/'
                }]
            },

            fonts: {
                files: [{
                    expand: true,
                    cwd: '<%= basos.src %>/',
                    src: [
                        'fonts/**',
                        '!fonts/src/**'
                    ],
                    dest: '<%= basos.dist %>/'
                }]
            },

            images: {
                files: [{
                    expand: true,
                    cwd: '<%= basos.src %>/',
                    src: [
                        'img/**',
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
                    '<%= basos.src %>/js/_mediaQueries.js',
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
                '<%= basos.src %>/js/*.js',
                '<%= basos.src %>/js/helpers/*.js',
                '<%= basos.src %>/js/modules/*.js',
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
                    '<%= basos.dist %>/css/temp.css': '<%= basos.src %>/scss/main.scss'
                }
            }
        },

        autoprefixer: {
            dev: {
                files: {
                    '<%= basos.dist %>/css/main.css': '<%= basos.dist %>/css/temp.css'
                }
            }
        },

        cmq: {
            dev: {
                files: {
                    '<%= basos.dist %>/css': ['<%= basos.dist %>/css/main.css']
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
            js: {
                files: ['<%= jshint.files %>'],
                tasks: ['clean:js', 'jshint', 'concat', 'copy:js'],
            },

            sass: {
                files: ['<%= basos.src %>/scss/**/*'],
                tasks: ['sass:dev', 'autoprefixer:dev', 'cmq:dev', 'clean:tempsass'],
            },

            fonts: {
                files: ['<%= basos.src %>/fonts/**/*'],
                tasks: ['clean:fonts', 'copy:fonts']
            },

            images: {
                files: ['<%= basos.src %>/img/**/*'],
                tasks: ['clean:images', 'copy:images']
            }
        },

        connect: {
            server: {
                options: {
                    hostname: '0.0.0.0',
                    port: 9000,
                    keepalive: true
                }
            }
        },

        browserSync: {
            dev: {
                bsFiles: {
                    src : [
                        '<%= basos.dist %>/js/app.js',
                        '<%= basos.dist %>/js/main.js',
                        '<%= basos.dist %>/js/vendor/modernizr/modernizr.js',
                        '<%= basos.dist %>/css/main.css',
                        '<%= basos.dist %>/img/**/*',
                        '<%= basos.dist %>/fonts/**/*',
                        '*.html',
                        '*.php',
                        '*.tpl'
                    ]
                },

                options: {
                    proxy: '0.0.0.0:9000',
                    ghostMode: {
                        clicks: false,
                        location: false,
                        forms: true,
                        scroll: false
                    },
                    scrollProportionally: false,
                    startPath: '/index.html'
                }
            }
        },

        hologram: {
            generate: {
                options: {
                    config: 'hologram_config.yml'
                }
            }
        },

    });

    grunt.registerTask('dev', [
        'jshint',
        'clean',
        'concat',
        'copy',
        'sass:dev',
        'autoprefixer:dev',
        'cmq:dev',
        'clean:tempsass'
    ]);

    grunt.registerTask('dist', [
        'jshint',
        'clean',
        'concat',
        'copy',
        'sass:dev',
        'autoprefixer:dev',
        'cmq:dev',
        'clean:tempsass',
        'cssmin',
        'uglify',
        'imagemin',
        'imageoptim'
    ]);

    grunt.registerTask('default', ['dev', 'watch']);

};