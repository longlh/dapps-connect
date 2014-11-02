'use strict';

var swig = new require('swig'),
	instance = new swig.Swig({
		varControls: [ '[[', ']]' ]
	});

module.exports = instance;