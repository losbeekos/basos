module.exports = {
    options: {
        advanced: false, // If true: "background: transparent;" is removed
    },
    minify: {
        expand: true,
        cwd: '<%= basos.dist %>/css/',
        src: ['main.css', '!*.min.css'],
        dest: '<%= basos.dist %>/css/',
        ext: '<%= minifyExt.css %>',
    }
}