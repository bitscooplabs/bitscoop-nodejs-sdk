'use strict';


module.exports = function(grunt) {
	grunt.initConfig({
		package: grunt.file.readJSON('package.json'),

		eslint: {
			all: {
				options: {
					configFile: 'eslint.json'
				},
				src: [
					'Gruntfile.js',
					'main.js',
					'lib/**/*.js',
					'test/**/*.js'
				]
			}
		},

		jsonlint: {
			eslint: {
				src: 'eslint.json'
			},
			package: {
				src: 'package.json'
			}
		},

		mochaTest: {
			full: {
				src: [
					'test/**/*.js'
				]
			},
			grid: {
				options: {
					reporter: 'dot'
				},
				src: '<%= mochaTest.full.src %>'
			}
		}
	});

	require('load-grunt-tasks')(grunt);

	grunt.registerTask('lint', [
		'jsonlint:package',
		'jsonlint:eslint',
		'eslint'
	]);

	grunt.registerTask('test', [
		'mochaTest:full'
	]);

	grunt.registerTask('test:grid', [
		'mochaTest:grid'
	]);

	grunt.registerTask('default', [
		'lint',
		'test:grid'
	]);
};
