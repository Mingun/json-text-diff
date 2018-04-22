'use strict';

module.exports = function(config) {
  config.set({
    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['browserify', 'mocha'],

    // list of files / patterns to load in the browser
    files: [
      'test/browser-setup.js',
      'lib/**/*.js',
      'test/**/*.js',
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'lib/**/*.js':  ['browserify'],
      'test/**/*.js': ['browserify'],
    },
    browserify: {
      debug: true,
      transform: [
        ['babelify', {
          global: true,
          presets: [['env', { useBuiltIns: true, loose: true }]],
        }]
      ]
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['mocha'],

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,
  });
};
