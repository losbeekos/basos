module.exports = function(grunt) {

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

        uglify: {
            options: {
                compress: {
                    drop_console: true
                }
            },

            dynamic_mappings: {
                files: [
                    {
                        expand: true,
                        cwd: 'js/',
                        src: ['main.js', 'app.js'],
                        dest: 'js/',
                        ext: '.<%= grunt.template.today("ddmmyyyyhhMMss") %>.js',
                        extDot: 'first'
                    },
                ]
            },
        },

        jshint: {
            files: ['Gruntfile.js', 'js/*.js', 'js/helpers/*.js', 'js/modules/*.js'],
            options: {
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

        autoprefixer: {
            dist: {
                files: {
                    'css/main.css': 'css/main.css'
                }
            }
        },

        compass: {
            dist: {
                options: {
                    sassDir: 'scss',
                    cssDir: 'css',
                    environment: 'development',
                    outputStyle: 'expanded'
                }
            }
        },

        watch: {
            files: ['<%= jshint.files %>', 'scss/**/*.scss'],
            tasks: ['concat', 'jshint', 'compass', 'autoprefixer']
        }

    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-autoprefixer');

    grunt.registerTask('default', ['concat', 'jshint', 'compass', 'autoprefixer', 'watch']);

};