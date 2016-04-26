module.exports = {
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

    fontello: {
        files: [{
            expand: true,
            cwd: '<%= basos.src %>/fonts/src/fontello/font/',
            src: [
                '**'
            ],
            dest: '<%= basos.src %>/fonts/icons/',
            rename: function(dest, src) {
                return dest + src.replace('fontello','icons');
            }
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
}