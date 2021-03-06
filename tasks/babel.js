module.exports = {
	options: {
		sourceMap: 'inline',
		presets: ['es2015']
	},

	dist: {
		files: [{
			'expand': true,
			'cwd': '<%= basos.dist %>/js/',
			'src': ['app.js'],
			'dest': '<%= basos.dist %>/js/',
			'ext': '.js'
		}]
	}
}