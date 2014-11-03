'use strict';
var path = require('path');

var paths = {
	js: {
		server: [ 'server/**/*.js'],
		client: [ 'client/**/*.js', '!client/vendors/**' ]
	},
	css: [ 'client/assets/css/*.css' ]
};

var assets = require('./config/assets/assets.json'),
	replacePatterns;

module.exports = function(grunt) {
	grunt.initConfig({
		clean: {
			build: [ 'client/assets/public', 'config/assets/css.json', 'config/assets/js.json', 'config/assets/img.json' ],
			temp: [ '.tmp/**', 'client/scss/_common.scss' ]
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
				formatters: [ {
					id: 'lint-xml',
					dest: 'build/reports/csslint.xml'
				} ]
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
					dest: '.tmp/css',
					ext: '.css'
				} ]
			}
		},
		uglify: {
			options: {
				sourceMap: true
			},
			build: {
				files: assets.js
			}
		},
		cssmin: {
			build: {
				files: assets.css
			}
		},
		assets_versioning: {
			options: {
				use: 'hash',
				versionsMapTrimPath: 'client/assets/public'
			},
			js: {
				options: {
					tasks: [ 'uglify:build'],
					versionsMapFile: 'config/assets/js.json'
				}
			},
			css: {
				options: {
					tasks: [ 'cssmin:build' ],
					versionsMapFile: 'config/assets/css.json'
				}
			}
		},
		filerev: {
			img: {
				options: {
					dest: 'config/assets/img.json'
				},
				files: [ {
					expand: true,
					cwd: 'client/assets/img/',
					src: [ '*.*' ],
					dest: 'client/assets/public/img/'
				} ]
			}
		},
		filerev_assets: {
			img: {
				options: {
					dest: 'config/assets/img.json',
					cwd: 'client/assets'
				}
			}
		},
		replace: {
			options: {
				patterns: [ {
					json: function(done) {
						if (!replacePatterns) {
							replacePatterns = {};

							var imgrev = grunt.filerev.summary;

							var keys = Object.keys(imgrev);

							for (var i = 0; i < keys.length; i++) {
								var key = keys[i];
								replacePatterns[path.basename(key)] = path.basename(imgrev[key]);
							}
						}

						done(replacePatterns);
					}
				} ]
			},
			build: {
				files: {
					'client/scss/_common.scss': 'client/scss/common.tmp.scss'
				}
			}
		}
	});

	// load all plugins
	require('load-grunt-tasks')(grunt);

	// grunt.loadNpmTasks('grunt-ver');

	grunt.registerTask('default', [ 'clean:build', 'filerev', 'filerev_assets', 'replace', 'sass', 'csslint', 'jshint', 'assets_versioning', 'clean:temp' ]);
};