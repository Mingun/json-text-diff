'use strict';

module.exports = {
  Diff: require('./diff')
};

try {
  // Optional dependency
  module.exports.generateDiff = require('./generate');
} catch (e) {
  // istanbul ignore next
  if (e.code !== 'MODULE_NOT_FOUND') {
    throw e;
  }
  // istanbul ignore next
  Object.defineProperty(module.exports, 'generateDiff', { get() { throw e; } });
}
