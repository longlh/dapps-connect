'use strict';
var _ = rek('lodash');

var config = {
	cookie: {
		auth: 'dapps-sso',
		i18n: 'l'
	},
	cdn: ''
};

var profile = process.env.NODE_ENV || 'development';

module.exports = _.assign(config, rek('config/profiles/' + profile));