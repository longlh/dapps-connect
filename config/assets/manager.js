'use strict';

var conf = rek('config/profiles/all');

module.exports = function(app) {
	var rev = rek('config/assets/rev.json'),
		assets = {},
		keys = Object.keys(rev),
		originalName, versionedName, i;

	for (i = 0; i < keys.length; i++) {
		originalName = keys[i].replace('build/.tmp', '');
		versionedName = rev[keys[i]].replace('/public', '');

		assets[originalName] = versionedName;
	}

	app.use(function(req, res, next) {
		res.locals._assets = function(originalPath) {
			return conf.cdn + assets[originalPath];
		};

		next();
	});

	if (conf.debug) {
		app.use(require('express').static('client/assets/public/'));
	}
};