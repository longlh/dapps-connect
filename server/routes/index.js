'use strict';

module.exports = function(app) {
	app._get('home', '/', function(req, res, next) {
		res.render('index', {
			message: 'Connect'
		});
	});
};