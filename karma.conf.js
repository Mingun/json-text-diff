'use strict';

const BROWSERS = {
  'IE@latest': {
    'Windows': ['10'],
  },
  'Edge@latest': {
    'Windows': ['10'],
  },
  'Firefox@latest': {
    'Windows': ['10', 'XP'],
    'OS X': ['High Sierra', 'Mountain Lion', 'Lion'],
  },
  'Chrome@latest': {
    'Windows': ['10', 'XP'],
    'OS X': ['High Sierra', 'Mountain Lion'],
  },
  'Opera@latest': {
    'Windows': ['10', 'XP'],
    'OS X': ['High Sierra', 'Mavericks', 'Mountain Lion', 'Snow Leopard'],
  },
  'Opera@12.16': {
    'Windows': ['8.1'],
  },
  'Safari@latest': {
    'OS X': ['High Sierra', 'Sierra', 'El Capitan', 'Yosemite', 'Mavericks', 'Mountain Lion', 'Lion', 'Snow Leopard'],
  },
};

function withBrowserStack(cfg) {
  let env = process.env;
  if (!env.BROWSER_STACK_USERNAME) {
    console.log('env.BROWSER_STACK_USERNAME not set - Manual local mode activated');

    return cfg;
  }

  let config = {
    browserStack: {
      project: 'structured-diff',
      name:  env.CI ? `Unit tests (job #${env.TRAVIS_JOB_NUMBER})` : 'Unit tests (manual)',
      build: env.CI ? `TRAVIS #${env.TRAVIS_BUILD_NUMBER} (commit ${env.TRAVIS_COMMIT})` : 'Manual',
      video: false,
    },

    customLaunchers: Object.keys(BROWSERS).reduce((acc, browser) => {
      let parts = browser.split('@');
      let platforms = BROWSERS[browser];

      Object.keys(platforms).reduce((acc, os) => {
        for (let version of platforms[os]) {
          acc[browser + '-' + os + ' ' + version] = {
            base: 'BrowserStack',
            browser: parts[0],
            browser_version: parts[1],
            os: os,
            os_version: version,
          };
        }
        return acc;
      }, acc);

      return acc;
    }, []),
  };

  if (env.CI) {
    config.browserStack.tunnelIdentifier = env.TRAVIS_JOB_NUMBER;
  }
  cfg.reporters.push('BrowserStack');
  cfg.browsers = Object.keys(config.customLaunchers);

  return Object.assign(cfg, config);
}

module.exports = function(config) {
  config.set(withBrowserStack({
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

    concurrency: 5,
  }));
};
