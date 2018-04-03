'use strict';

// All available options for free plan
const BROWSERS = {
  'chrome@latest':  [
    'Windows 10', 'Windows 8.1', 'Windows 8', 'Windows 7',
    'Linux',
    'macOS 10.13', 'macOS 10.12', 'OS X 10.11', 'OS X 10.10', 'OS X 10.9'
  ],
  'firefox@latest': [
    'Windows 10', 'Windows 8.1', 'Windows 8', 'Windows 7',
    'Linux',
    'macOS 10.13', 'macOS 10.12', 'OS X 10.11', 'OS X 10.10', 'OS X 10.9'
  ],
  'internet explorer@latest': ['Windows 10', 'Windows 8.1', 'Windows 8', 'Windows 7'],
  'MicrosoftEdge@latest': ['Windows 10'],
  'safari@latest': ['macOS 10.13', 'macOS 10.12', 'OS X 10.11', 'OS X 10.10', 'OS X 10.9'],
};

function withSauceLabs(cfg) {
  let env = process.env;
  if (!env.SAUCE_USERNAME) {
    console.log('env.SAUCE_USERNAME not set - Manual local mode activated');

    return cfg;
  }

  let config = {
    sauceLabs: {
      tags: ['structured-diff'],
      public: 'public',
      testName: env.CI ? `Unit tests (job #${env.TRAVIS_JOB_NUMBER})` : 'Unit tests (manual)',
      build:    env.CI ? `TRAVIS #${env.TRAVIS_BUILD_NUMBER} (commit ${env.TRAVIS_COMMIT})` : 'Manual',
      recordVideo: false,
      recordScreenshots: false,
    },

    customLaunchers: Object.keys(BROWSERS).reduce((acc, browser) => {
      let parts = browser.split('@');

      BROWSERS[browser].reduce((acc, platform) => {
        acc[browser + '-' + platform] = {
          base: 'SauceLabs',
          browserName: parts[0],
          version: parts[1],
          platform: platform,
        };

        return acc;
      }, acc);

      return acc;
    }, []),
  };

  if (env.CI) {
    config.sauceLabs.tunnelIdentifier = env.TRAVIS_JOB_NUMBER;
  }
  cfg.reporters.push('saucelabs');
  cfg.browsers = Object.keys(config.customLaunchers);

  return Object.assign(cfg, config);
}

module.exports = function(config) {
  config.set(withSauceLabs({
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
  }));
};
