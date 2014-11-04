'use strict';
var path = require('path'),
	assets = require('./config/assets/assets.json'),
	replacePatterns;

module.exports = function(grunt) {
	grunt.initConfig({
		clean: {
			build: [ 'client/assets/public/**', 'config/assets/rev.json' ],
			temp: [ '.tmp/**', 'client/scss/_common.scss', 'client/assets/public/**/*.js.*.map' ]
		},
		jshint: {
			server: {
				src: [ 'server/**/*.js', 'app.js', 'Gruntfile.js', 'config/**/*.js' ],
				options: {
					jshintrc: 'build/rules/.jshintrc-server',
					reporter: 'jslint',
					reporterOutput: 'build/reports/jshint-server.xml'
				}
			},
			client: {
				src: [ 'client/**/*.js', '!client/vendors/**/*.js', '!client/assets/public/**/*.js' ],
				options: {
					jshintrc: 'build/rules/.jshintrc-client',
					reporter: 'jslint',
					reporterOutput: 'build/reports/jshint-client.xml'
				}
			}
		},
		csslint: {
			src: [ '.tmp/scss-css/**/*.css' ],
			options: {
				csslintrc: 'build/rules/.csslintrc',
				absoluteFilePathsForFormatters: true,
				formatters: [ {
					id: 'lint-xml',
					dest: 'build/reports/csslint.xml'
				} ]
			}
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
					dest: '.tmp/scss-css',
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
		filerev: {
			img: {
				files: [ {
					expand: true,
					cwd: 'client/assets/img/',
					src: [ '**/*' ],
					dest: 'client/assets/public/img/'
				} ]
			},
			js: {
				files: [ {
					expand: true,
					cwd: '.tmp/js',
					src: [ '**/*' ],
					dest: 'client/assets/public/js/'
				} ]
			},
			css: {
				files: [ {
					expand: true,
					cwd: '.tmp/css',
					src: [ '**/*' ],
					dest: 'client/assets/public/css/'
				} ]
			}
		},
		filerev_assets: {
			rev: {
				options: {
					dest: 'config/assets/rev.json',
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
					legacyWatch: true,
					delay: 2000,
					cwd: __dirname,
					ignore: [ 'node_modules', '.tmp', 'client/assets/public', 'client/vendors' ]
				}
			}
		},
		watch: {
			scss: {
				files: [ 'config/assets/assets.json', 'client/assets/img/**', 'client/scss/**', '!client/scss/_common.scss', '!client/assets/public/**' ],
				tasks: [ 'filerev:img', 'replace', 'sass', 'csslint', 'cssmin', 'filerev:css', 'filerev_assets', 'clean:temp' ]
			},
			client: {
				files: [ 'config/assets/assets.json', 'client/**/*.js', '!client/assets/public/**', '!client/vendors/**' ],
				tasks: [ 'jshint', 'uglify', 'filerev:js', 'filerev_assets', 'clean:temp' ]
			},
			server: {
				files: [ 'server/**/*.js', 'config/**/*.js' ],
				options: {
					reload: true
				}
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

	grunt.registerTask('build', [ 'clean:build', 'filerev:img', 'replace', 'sass', 'csslint', 'jshint', 'uglify', 'cssmin', 'filerev:js', 'filerev:css', 'filerev_assets', 'clean:temp' ]);

	grunt.registerTask('default', [ 'build', 'concurrent:dev' ]);
};