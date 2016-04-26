module.exports = {
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
                ext: '<%= minifyExt.js %>',
                extDot: 'first'
            },
        ]
    }
}