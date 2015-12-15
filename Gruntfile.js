module.exports = function(grunt) {

     //load all grunt tasks matching the `grunt-*` pattern
    require('jit-grunt')(grunt);
    require('time-grunt')(grunt);

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
            fonts: ['<%= basos.dist %>/fonts'],
            images: ['<%= basos.dist %>/img']
        },

        copy: {
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
            app: {
                options: {
                    sourceMap: true
                }, 

                src: [
                    // Bower components
                    'bower_components/fastclick/lib/fastclick.js',
                    'bower_components/fitvids/jquery.fitvids.js',
                    'bower_components/jquery-placeholder/jquery.placeholder.js',
                    'bower_components/parsleyjs/src/i18n/nl.js',
                    'bower_components/parsleyjs/dist/parsley.js',
                    'bower_components/rangeslider.js/dist/rangeslider.js',

                    // Basos
                    '<%= basos.src %>/js/_settings.js',
                    '<%= basos.src %>/js/_mediaQueries.js',
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
                    sourceMap: true,
                    style: 'expanded'
                },

                files: {
                    '<%= basos.dist %>/css/main.css': '<%= basos.src %>/scss/main.scss'
                }
            }
        },

        postcss: {
            options: {
                map: true, // inline sourcemaps

              // or
              // map: {
              //     inline: false, // save all sourcemaps as separate files...
              //     annotation: 'dist/css/maps/' // ...to the specified directory
              // },

                processors: [
                    require('autoprefixer')({
                        browsers: 'last 2 versions'
                    })
                ]
            },
            dist: {
                src: '<%= basos.dist %>/css/main.css'
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
                        src: ['app.js', 'modernizr.js'],
                        dest: '<%= basos.dist %>/js/',
                        ext: '.'+todayTimestamp+'.min.js',
                        extDot: 'first'
                    },
                ]
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
                tasks: ['clean:js', 'jshint', 'concat'],
            },

            // Basos
            sass: {
                files: ['<%= basos.src %>/scss/**/*'],
                tasks: ['sass:dev', 'postcss'],
            },

            // Peanuts
            // sass: {
            //     files: ['<%= basos.src %>/scss/**/*'],
            //     tasks: ['sass:dev', 'postcss', 'css_wrap'],
            // },

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
                    src: [
                        '<%= basos.dist %>/js/**/*.js',
                        '<%= basos.dist %>/css/main.css',
                        '<%= basos.dist %>/img/**/*',
                        '<%= basos.dist %>/fonts/**/*',
                        '*.html',
                        '*.php',
                        '*.tpl'
                    ]
                },

                options: {
                    // ui: false,
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

        // @TODO
        // https://github.com/FWeinb/grunt-svgstore
        // Check this screencast: https://css-tricks.com/video-screencasts/screencast-134-tour-site-progress-built-jekyll-grunt-sass-svg-system/
        svgstore: {
            options: {
                prefix : 'shape-', // This will prefix each ID
                // svg: { // will add and overide the the default xmlns="http://www.w3.org/2000/svg" attribute to the resulting SVG
                //     viewBox : '0 0 100 100',
                //     xmlns: 'http://www.w3.org/2000/svg'
                // }
            },
            your_target: {
                // Target-specific file lists and/or options go here.
            },
        },

        hologram: {
            generate: {
                options: {
                    config: 'hologram_config.yml'
                }
            }
        },

        /**
          * Create frontend styles specifically for peanuts
         */
        css_wrap: {
            compile: {
                src: '<%= basos.dist %>/css/main.css',
                dest: '<%= basos.dist %>/css/peanuts.css',
                options: {
                    selector: '.peanuts'
                }
            }
        },

        modernizr: {
            dev:  {
                'dest' : '<%= basos.dist %>/js/modernizr.js',
                'parseFiles': true,
                'devFile': 'modernizr.js',
                'outputFile' : '<%= basos.dist %>/js/modernizr.js',
                'files': {
                    'src': [
                        '<%= basos.dist %>/css/main.css',
                        '<%= basos.dist %>/js/app.js'
                    ]
                },
                'options' : [
                    'setClasses',
                    'html5shiv',
                    'addTest',
                    'html5printshiv',
                    'testProp',
                    'fnBind',
                    'mq'
                ],
                'excludeTests': [
                    'ellipsis',
                    'json',
                    'svg',
                    'supports',
                    'csstransitions',
                    'cookies',
                    'target',
                    'borderradius',
                    'placeholder',
                    'notification'
                ],
                'customTests': [],
                'uglify': false
            }
        }

    });

    // Basos tasks

    grunt.registerTask('dev', [
        'jshint',
        'clean',
        'concat',
        'copy',
        'sass:dev',
        'postcss',
        'modernizr'
    ]);

    grunt.registerTask('dist', [
        'jshint',
        'clean',
        'concat',
        'copy',
        'sass:dev',
        'postcss',
        'cssmin',
        'modernizr',
        'uglify',
        'imagemin',
        'imageoptim',
    ]);

    // Peanuts tasks
    
    // grunt.registerTask('dev', [
    //     'jshint',
    //     'clean',
    //     'concat',
    //     'copy',
    //     'sass:dev',
    //     'postcss',
    //     'css_wrap',
    // ]);

    // grunt.registerTask('dist', [
    //     'jshint',
    //     'clean',
    //     'concat',
    //     'copy',
    //     'sass:dev',
    //     'postcss',
    //     'cssmin',
    //     'uglify',
    //     'imagemin',
    //     'imageoptim',
    //     'css_wrap',
    // ]);

    grunt.registerTask('default', ['dev', 'watch']);

};