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
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-browser-sync');

    var todayTimestamp = '<%= grunt.template.today("ddmmyyyyhhMMss") %>';

    var basosConfig = {
      src: 'src',
      dist: 'dist'
    };

    var http = require('http');
    var gateway = require('gateway');

    var app = http.createServer(gateway(__dirname, {
      '.php': 'php-cgi'
    }));

    var LIVERELOAD_PORT = 35729;
    var lrSnippet = require('connect-livereload')({ port: LIVERELOAD_PORT });
    var mountFolder = function (connect, dir) {
      return connect.static(require('path').resolve(dir));
    };
    var phpMiddleware = require('connect-php');

    try {
        basosConfig.app = require('./bower.json').appPath || basosConfig.app;
    } catch (e) {}

    grunt.initConfig({
        basos: basosConfig,
        pkg: grunt.file.readJSON('package.json'),

        clean: {
            js: ['<%= basos.dist %>/js'],
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

            js: {
                files: ['<%= jshint.files %>'],
                tasks: ['clean:js', 'jshint', 'concat', 'copy:js'],
            },

            sass: {
                files: ['src/scss/**/*'],
                tasks: ['sass:dev', 'autoprefixer:dev'],
            },

            fonts: {
                files: ['src/fonts/**/*'],
                tasks: ['clean:fonts', 'copy:fonts']
            },

            images: {
                files: ['src/img/**/*'],
                tasks: ['clean:images', 'copy:images']
            }

            // dom: {
            //     files: ['**/*.tpl', '**/*.php', '**/*.html'],
            // }
        },

        connect: {
            server: {
                options: {
                    hostname: '0.0.0.0',
                    port: 9000,
                    keepalive: true,
                    middleware: function(connect, options) {
                        var middlewares = [];
                        var directory = options.directory ||
                        options.base[options.base.length - 1];

                        if (!Array.isArray(options.base)) {
                            options.base = [options.base];
                        }

                        middlewares.push(phpMiddleware(directory));

                        options.base.forEach(function(base) {
                            middlewares.push(connect.static(base));
                        });

                        middlewares.push(connect.directory(directory));
                        return middlewares;
                    }
                }
            }
        },

        browserSync: {
            dev: {
                bsFiles: {
                    src : [
                        'dist/js/app.js',
                        'dist/js/main.js',
                        'dist/js/vendor/modernizr/modernizr.js',
                        'dist/css/main.css',
                        'dist/img/**/*',
                        'dist/fonts/**/*',
                        '*.html',
                        '*.php',
                        '*.tpl'
                    ]
                },

                options: {
                    browser: ['google chrome', 'firefox', 'safari', 'opera'],
                    proxy: '0.0.0.0:9000',
                    ghostMode: {
                        clicks: true,
                        location: true,
                        forms: true,
                        scroll: true
                    },
                    scrollProportionally: true,
                    startPath: '/index.html'
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
        'autoprefixer:dev'
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
        'imageoptim'
    ]);

    grunt.registerTask('default', ['dev', 'watch']);

};