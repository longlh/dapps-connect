'use strict';

var paths = {
	js: {
		server: [ 'server/**/*.js'],
		client: [ 'client/**/*.js', '!client/vendors/**' ]
	},
	css: [ 'client/assets/css/*.css' ]
};

module.exports = function(grunt) {
	grunt.initConfig({
		clean: {
			build: [ 'client/assets/css/**', 'client/assets/js/**' ],
			temp: [ '.tmp/**']
		},
		jshint: {
			server: {
				src: paths.js.server,
				options: {
					jshintrc: 'build/rules/.jshintrc-server',
					reporter: 'jslint',
					reporterOutput: 'build/reports/jshint-server.xml'
				}
			},
			client: {
				src: paths.js.client,
				options: {
					jshintrc: 'build/rules/.jshintrc-client',
					reporter: 'jslint',
					reporterOutput: 'build/reports/jshint-client.xml'
				}
			}
		},
		csslint: {
            options: {
                csslintrc: 'build/rules/.csslintrc',
                absoluteFilePathsForFormatters: true,
                formatters: [{
                    id: 'lint-xml',
                    dest: 'build/reports/csslint.xml'
                }]
            },
            src: paths.css
        },
		sass: {
			build: {
				options: {
					style: 'expanded'
				},
				files: [ {
					expand: true,
					cwd: 'client/scss',
					src: [ '*.scss' ],
					dest: 'client/assets/css',
					ext: '.css'
				} ]
			}
		}
	});

	// load all plugins
	require('load-grunt-tasks')(grunt);

	grunt.registerTask('default', [ 'clean', 'sass', 'jshint', 'csslint' ]);
};