'use strict';

let safeStringify = require('safe-stable-stringify');
let textDiff = require('diff');
let unified  = require('./unified');

function isString(value) {
  return typeof value === 'string';
}

function stringify(obj) {
  if (obj === undefined) { return 'undefined'; }
  // Remove commas from end lines
  return safeStringify(obj, null, 2).replace(/,(\n|$)/g, '$1');
}

/**
 * Creates diffs for given error by comparing `expected` and `actual` converted to strings.
 *
 * @api public
 * @param {Object} expected Base object which will be show as removed part of diff
 * @param {Object} actual New object which will be showed as added part of diff
 * @return {Object} Generated structured diff
 */
function generateDiff(expected, actual) {
  if (!isString(expected) || !isString(actual)) {
    expected = stringify(expected);
    actual   = stringify(actual);
  }

  return unified(textDiff.diffLines(expected, actual));
}

module.exports = generateDiff;
