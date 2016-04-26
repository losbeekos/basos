/**
  * Create frontend styles specifically for peanuts
 */

module.exports = {
    compile: {
        src: '<%= basos.dist %>/css/main.css',
        dest: '<%= basos.dist %>/css/peanuts.css',
        options: {
            selector: '.peanuts'
        }
    }
}