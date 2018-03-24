'use strict';

let safeStringify = require('safe-stable-stringify');
let Diff = require('./diff');

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
 * Stringification performed only if or `expected`, or `actual` or both are not strings.
 * It is stable (always produce the same results for the same objects) and can handle
 * recursive structures.
 *
 * Currently stringification performed with [`safe-stable-stringify`][1] library.
 *
 * [1]: https://www.npmjs.com/package/safe-stable-stringify
 *
 * @api public
 * @param {Object} expected Base object which will be show as removed part of diff
 * @param {Object} actual New object which will be showed as added part of diff
 * @param {Object?} options The object containing options for a diff algorithm.
 *        See documentation for `Diff` class for supported options
 * @return {Object[]} Generated structured diff
 */
function generateDiff(expected, actual, options) {
  if (!isString(expected) || !isString(actual)) {
    expected = stringify(expected);
    actual   = stringify(actual);
    options  = Object.assign({}, options, { hint: { type: 'json', indent: 2 } });
  }

  return new Diff(expected, actual, options);
}

module.exports = generateDiff;
