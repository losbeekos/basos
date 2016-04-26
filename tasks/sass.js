module.exports = {
    dev: {
        options: {
            sourceMap: true,
            style: 'expanded'
        },

        files: {
            '<%= basos.dist %>/css/main.css': '<%= basos.src %>/scss/main.scss'
        }
    }
}