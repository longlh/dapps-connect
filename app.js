'use strict';

// declare extra globals
global.rek = require('rekuire');

var conf = rek('config/profiles/all');
conf.root = __dirname;

// load modules
rek('server').listen(conf.port, function() {
	console.log('Application has started at ' + conf.port + ' (' + process.env.NODE_ENV + ')');
});
