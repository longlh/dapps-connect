'use strict';
var path = require('path');

var paths = {
	js: {
		server: [ 'server/**/*.js'],
		client: [ 'client/**/*.js', '!client/vendors/**/*.js', '!client/assets/public/**/*.js' ]
	},
	css: [ 'client/assets/css/*.css' ]
};

var assets = require('./config/assets/assets.json'),
	replacePatterns;

module.exports = function(grunt) {
	grunt.initConfig({
		clean: {
			build: [ 'client/assets/public/**', 'config/assets/css.json', 'config/assets/js.json', 'config/assets/img.json' ],
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
					style: 'compressed',
					noCache: true,
					sourcemap: 'none'
				},
				files: [ {
					expand: true,
					cwd: 'client/scss',
					src: [ '*.scss', '!*.tmp.scss' ],
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
		},
		nodemon: {
			dev: {
				script: 'app.js',
				options: {
					env: {
						NODE_ENV: 'development'
					},
					legacyWatch: true
				}
			}
		},
		watch: {
			scss: {
				files: [ 'config/assets/assets.json', 'client/assets/img/**', 'client/scss/**', '!client/scss/_common.scss' ],
				tasks: [ 'filerev', 'filerev_assets', 'replace', 'sass', 'csslint', 'assets_versioning:css', 'clean:temp' ]
			},
			client: {
				files: [ 'config/assets/assets.json', 'client/**/*.js' ],
				tasks: [ 'jshint', 'assets_versioning:js' ]
			},
			server: {
				files: [ 'server/**/*.js', 'config/**/*.js' ]
			}
		},
		concurrent: {
			dev: {
				tasks: [ 'nodemon:dev', 'watch' ],
				options: {
					logConcurrentOutput: true
				}
			}
		}
	});

	// load all plugins
	require('load-grunt-tasks')(grunt);

	// grunt.loadNpmTasks('grunt-ver');

	grunt.registerTask('build', [ 'clean:build', 'filerev', 'filerev_assets', 'replace', 'sass', 'csslint', 'jshint', 'assets_versioning', 'clean:temp' ]);

	grunt.registerTask('default', [ 'build', 'concurrent:dev' ]);
};