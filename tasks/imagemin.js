module.exports = {
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
}