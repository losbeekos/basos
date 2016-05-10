module.exports = {
	options: {
		map: true, // inline sourcemaps

		// or
		// map: {
		//     inline: false, // save all sourcemaps as separate files...
		//     annotation: 'dist/css/maps/' // ...to the specified directory
		// },

		processors: [
			require('autoprefixer')({ browsers: 'last 4 versions' }),
			require('postcss-flexbugs-fixes'),
		]
	},
	dist: {
		src: '<%= basos.dist %>/css/main.css'
	}
}