module.exports = {
	js: {
		files: ['<%= jshint.files %>'],
		tasks: ['jshint', 'concat', 'docs'],
	},

	// Basos
	sass: {
		files: ['<%= basos.src %>/scss/**/*'],
		tasks: ['sass:dev', 'postcss', 'docs'],
	},

	// Peanuts
	// sass: {
	//     files: ['<%= basos.src %>/scss/**/*'],
	//     tasks: ['sass:dev', 'postcss', 'css_wrap'],
	// },

	fonts: {
		files: ['<%= basos.src %>/fonts/icons/*'],
		tasks: ['clean:fonts', 'copy:fonts', 'docs']
	},

	fontello: {
		files: ['<%= basos.src %>/fonts/src/fontello/font/**'],
		tasks: ['copy:fontello', 'docs']
	},

	images: {
		files: ['<%= basos.src %>/img/**/*'],
		tasks: ['clean:images', 'copy:images', 'docs']
	}
}