'use strict';

// third-party modules
var express = require('express'),
	fs = require('fs'),
	mongoose = require('mongoose'),
	path = require('path'),
	reverseRoute = require('reverse-route');

// local modules
var conf = rek('config/profiles/all'),
	swig = rek('config/view-engines/swig');

var app = reverseRoute(express());

// initialize db
mongoose.connect(conf.db);

// initialize view engine SWIG
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', path.resolve(__dirname, 'views'));

// configure

// AUTOLOAD ./models/*
fs.readdirSync(path.resolve(__dirname, 'models')).forEach(function(file) {
	require(path.resolve(__dirname, 'models', file));
});

// AUTOLOAD ./routes/*
fs.readdirSync(path.resolve(__dirname, 'routes')).forEach(function(file) {
	require(path.resolve(__dirname, 'routes', file))(app);
});

module.exports = app;