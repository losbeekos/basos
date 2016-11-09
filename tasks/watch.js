module.exports = {
	js: {
		files: ['<%= jshint.files %>'],
		tasks: ['jshint', 'concat:app', 'babel', 'concat:all'],
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
		files: ['<%= basos.src %>/fonts/icons/*'],
		tasks: ['clean:fonts', 'copy:fonts']
	},

	fontello: {
		files: ['<%= basos.src %>/fonts/src/fontello/font/**'],
		tasks: ['copy:fontello']
	},

	images: {
		files: ['<%= basos.src %>/img/**/*'],
		tasks: ['clean:images', 'copy:images', 'svg_sprite']
	}
}