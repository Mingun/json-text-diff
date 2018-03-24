'use strict';

let textDiff = require('diff');
let unified  = require('./unified');
let inline   = require('./inline');
let hunks    = require('./hunk');

class Diff {
  /**
   * Creates diffs for given `expected` and `actual` strings.
   *
   * @api public
   * @param {String} expected Base string which will be show as removed part of diff
   * @param {String} actual New string which will be showed as added part of diff
   * @param {Object?} options The object containing options for a diff algorithm.
   *        Supported options:
   *        - boolean `ignoreWhitespace`: ignores whitespace changes in lines. Default: `false`
   *        - boolean `newlineIsToken`: if `true`, each symbol `\n` or sequence `\r\n` considered
   *          as separate token, otherwise it includes as part in preceding token. Default: `false`
   *        - boolean `ignoreCase`: if `true`, tokens are compared case-insensitive. Default: `false`
   *        - function(String, String) -> boolean `comparator`: function for compare tokens. Default: none
   */
  constructor(expected, actual, options) {
    this._rawDiff = textDiff.diffLines(expected, actual, options);
  }

  /**
   * Returns a diff in unified format for given `Diff` object.
   *
   * If parameter `context` is then method returns array of hunks with specified number
   * of context lines or with unlimited number of context lines if `context` is null.
   * If parameter omitted or `undefined` then returns array of lines, each of which
   * represents one line of the text.
   *
   * @api public
   * @param {number?} context How many lines of context to use in hunk?
   *
   * @return {Object[]} Array each element of it represents or line (if `context` is `undefined`)
   *         or hunk (if `context` is `null` or some number)
   */
  unified(context) {
    // istanbul ignore else Caching not tested
    if (!this._unified) {
      this._unified = unified(this._rawDiff);
    }
    return context === undefined ? this._unified : hunks(this._unified, context);
  }

  /**
   * Returns a diff in inline format for given `Diff` object.
   *
   * If parameter `context` is then method returns array of hunks with specified number
   * of context lines or with unlimited number of context lines if `context` is null.
   * If parameter omitted or `undefined` then returns array of lines, each of which
   * represents one line of the text.
   *
   * @api public
   * @param {number?} context How many lines of context to use in hunk?
   *
   * @return {Object[]} Array each element of it represents or line (if `context` is `undefined`)
   *         or hunk (if `context` is `null` or some number)
   */
  inline(context) {
    // istanbul ignore else Caching not tested
    if (!this._inline) {
      this._inline = inline(this._rawDiff);
    }
    return context === undefined ? this._inline : hunks(this._inline, context);
  }
}

module.exports = Diff;
