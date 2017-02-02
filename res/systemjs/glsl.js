/*
  glsl loader plugin for SystemJS
  created by Grigor Khachatryan / g@yvn.io
*/
exports.translate = function(load) {
	if (this.builder && this.transpiler) {
		load.metadata.format = 'esm';
		return 'exp' + 'ort default ' + JSON.stringify(load.source) + ';';
	}
  
	load.metadata.format = 'amd';
	return 'def' + 'ine(function() {\nreturn ' + JSON.stringify(load.source) + ';\n});';
}