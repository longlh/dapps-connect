'use strict';

// third-party modules
var express = require('express'),
	fs = require('fs'),
	mongoose = require('mongoose'),
	path = require('path'),
	reverseRoute = require('reverse-route');

// local modules
var conf = rek('config/profiles/all'),
	swig = rek('config/view-engines/swig'),
	assetManager = rek('config/assets/manager'),
	i18n = rek('config/locales/i18n');

var app = reverseRoute(express(), function(params, req) {
	params.locale = params.locale || req.param('locale') || i18n.getLocale(req);

	return params;
});

// log execute time
if (conf.debug) {
	app.use(function(req, res, next) {
		var start = process.hrtime();
		res.on('finish', function() {
			console.log(req.url + ' - ' + (process.hrtime(start)) + 'ms');
		});
		next();
	});
}

// initialize db
mongoose.connect(conf.db);

// initialize view engine SWIG
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', path.resolve(__dirname, 'views'));

// initialize assets manager
assetManager(app);

// initialize i18n
app.use(i18n.init);

// AUTOLOAD ./models/*
fs.readdirSync(path.resolve(__dirname, 'models')).forEach(function(file) {
	require(path.resolve(__dirname, 'models', file));
});

// AUTOLOAD ./routes/*
fs.readdirSync(path.resolve(__dirname, 'routes')).forEach(function(file) {
	// inject `app` object
	require(path.resolve(__dirname, 'routes', file))(app);
});

module.exports = app;