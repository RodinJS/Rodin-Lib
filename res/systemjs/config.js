(function (global) {

	var paths = {
		'npm:': 'dist/'
	};

	var map = {
		'rodin/core': 'npm:core',
		'rodin/physics': 'npm:physics'		
	};	

	var packages = {
		'dist': { main: 'index.js', defaultExtension: 'js' },
		'rodin/core': { main: 'index.js', defaultExtension: 'js' },
		'rodin/physics': { main: 'index.js', defaultExtension: 'js' },
	};

	var moduleNames = [
		'core/error',
		'core/time',
		'core/scene',
		'core/sculpt',
		'core/messenger',
		'core/eventEmitter',
		'core/utils',
		'core/set'
	];

	function packIndex(moduleName) {
		packages['' + paths['npm:'] + moduleName + ''] = { main: 'index.js', defaultExtension: 'js' };
	}

	moduleNames.forEach(packIndex);

	var config = {
		paths: paths,
		map: map,
		packages: packages
	};

	System.config(config);

})(this);