'use strict';

module.exports = function(app) {
	app.route('/').get(function(req, res, next) {
		res._redirect('home', {
			locale: 'en'
		});
	});

	app._route('home', '/:locale').get(function(req, res, next) {
		res.render('index', {
			message: 'Connect'
		});
	});

	app._route.add('home', {
		about: {
			view: 'about'
		}
	});

	// app._route.remove('home', 'about');
};