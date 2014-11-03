'use strict';

var fs = require('fs'),
	path = require('path');

var conf = rek('config/profiles/all');

module.exports = function(app, swig) {
	var rev = {
			js: rek('config/assets/js.json'),
			css: rek('config/assets/css.json'),
			img: rek('config/assets/img.json')
		},
		assets = {},
		imgKeys = Object.keys(rev.img),
		imgOriginalName, imgVersionedName, i;

	for (i = 0; i < rev.js.length; i++) {
		assets[rev.js[i].originalPath] = rev.js[i].versionedPath.replace(/\\/g, '/');
	}

	for (i = 0; i < rev.css.length; i++) {
		assets[rev.css[i].originalPath] = rev.css[i].versionedPath.replace(/\\/g, '/');
	}

	for (i = 0; i < imgKeys.length; i++) {
		imgOriginalName = path.basename(imgKeys[i]);
		imgVersionedName = path.basename(rev.img[imgKeys[i]]);

		assets['/img/' + imgOriginalName] = '/img/' + imgVersionedName;
	}

	app.use(function(req, res, next) {
		res.locals._assets = function(originalPath) {
			return assets[originalPath];
		};

		next();
	});

	if (conf.debug) {
		app.use(require('express').static('client/assets/public/'));
	}
};