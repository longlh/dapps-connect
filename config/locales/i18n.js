'use strict';

var i18n = require('i18n'),
	path = require('path');

var conf = rek('config/profiles/all');

i18n.configure({
	locales: [ 'en', 'vi' ],
	defaultLocale: 'en',
	cookie: conf.cookie.i18n,
	directory: path.resolve(__dirname, 'data'),
	updateFiles: true,
	extension: '.json'
});

module.exports = i18n;