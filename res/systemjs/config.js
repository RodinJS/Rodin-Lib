{
	map: {
		glsl: 'res/systemjs/glsl.js'  // path to glsl.js file
	},
	meta: {
		'build/*.glsl': {   // for all glsl files on your project
			loader: 'glsl'
		}
	},
	packages: {
		'/': {
			main: 'index',  // load rodin/sculpt/index.js by typing rodin/sculpt
			"defaultJSExtensions": true
		}
	}
}