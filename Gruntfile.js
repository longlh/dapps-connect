'use strict';
var path = require('path'),
	replacePatterns;

module.exports = function(grunt) {
	grunt.initConfig({
		clean: {
			build: [ 'client/assets/public/**', 'config/assets/rev.json' ],
			temp: [ 'build/.tmp/**', 'client/scss/_common.scss', 'client/assets/public/**/*.js.*.map' ]
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
			src: [ 'build/.tmp/scss-css/**/*.css' ],
			options: {
				csslintrc: 'build/rules/.csslintrc',
				absoluteFilePathsForFormatters: false,
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
					dest: 'build/.tmp/scss-css',
					ext: '.css'
				} ]
			}
		},
		uglify: {
			options: {
				sourceMap: true
			},
			build: {
				files: require('./config/assets/assets.json').js
			}
		},
		cssmin: {
			build: {
				files: require('./config/assets/assets.json').css
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
					cwd: 'build/.tmp/js',
					src: [ '**/*' ],
					dest: 'client/assets/public/js/'
				} ]
			},
			css: {
				files: [ {
					expand: true,
					cwd: 'build/.tmp/css',
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
		watch: {
			options: {
				spawn: false,
				reload: true
			},
			scss: {
				files: [ 'config/assets/assets.json', 'client/assets/img/**', 'client/scss/**', '!client/scss/_common.scss', '!client/assets/public/**' ],
				tasks: [ 'filerev:img', 'replace', 'sass', 'csslint', 'cssmin', 'filerev:css', 'filerev_assets', 'clean:temp', 'express:dev' ]
			},
			client: {
				files: [ 'config/assets/assets.json', 'client/**/*.js', '!client/assets/public/**', '!client/vendors/**' ],
				tasks: [ 'jshint:client', 'uglify', 'filerev:js', 'filerev_assets', 'clean:temp', 'express:dev' ]
			},
			server: {
				files: [ 'server/**/*.js', 'config/**/*.js' ],
				tasks: [ 'jshint:server', 'express:dev' ]
			},
			html: {
				files: [ 'server/views/**/*.html' ],
				tasks: [ 'express:dev' ]
			},
			system: {
				files: [ 'app.js', 'Gruntfile.js' ],
				tasks: [ 'express:dev' ]
			}
		},
		express: {
			dev: {
				options: {
					script: 'app.js',
					node_env: 'development'
				}
			}
		}
	});

	// load all plugins
	require('load-grunt-tasks')(grunt);

	grunt.registerTask('build', [ 'clean:build', 'filerev:img', 'replace', 'sass', 'csslint', 'jshint', 'uglify', 'cssmin', 'filerev:js', 'filerev:css', 'filerev_assets', 'clean:temp' ]);

	grunt.registerTask('default', [ 'build', 'express:dev', 'watch' ]);
};