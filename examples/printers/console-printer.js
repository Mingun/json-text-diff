'use strict';

/**
 * Pad the given `str` to `len`.
 *
 * @api private
 * @param {string} str
 * @param {string} len
 * @return {string}
 */
function pad(str, len) {
  str = String(str);
  return Array(len - str.length + 1).join(' ') + str;
}
/**
 * Allow printing colored lines to the console. Subclasses must implement
 * `colorize(line)`method.
 *
 * @api public
 * @param {function(string, string)} color Function that returns colorized version of input value
 *        for given style
 * @param {string} indent Indent that will be appended to each line
 */
function ConsolePrinter(colors, indent) {
  this.colors = colors;
  this.indent = indent === undefined ? '' : (Number.isInteger(indent) ? pad(' ', indent) : indent);
}

ConsolePrinter.prototype.stringifyHunk = function stringifyHunk(result, hunk, withLineNumbers, width) {
  if (withLineNumbers) {
    let i = hunk.oldStart;
    let j = hunk.newStart;

    for (let line of hunk.lines) {
      let del = '';
      let ins = '';
      if (line.kind !== '+') { del = i++; }
      if (line.kind !== '-') { ins = j++; }

      del = pad(del, width);
      ins = pad(ins, width);

      // colorize numbers: line removed/inserted/changed
      if (line.kind === '-') { del = this.colors.del(del); }
      if (line.kind === '+') { ins = this.colors.ins(ins); }
      if (line.kind === '?') {
        del = this.colors.change(del);
        ins = this.colors.change(ins);
      }

      result.push(this.indent +
        del + ' | ' +
        ins + ' | ' +
        this.colorize(line)
      );
    }
  } else {
    for (let line of hunk.lines) {
      result.push(this.indent + this.colorize(line));
    }
  }
};

ConsolePrinter.prototype.stringify = function stringify(hunks, withLineNumbers, width) {
  let result = [];
  for (let i = 0; i < hunks.length; ++i) {
    if (i !== 0) {
      result.push('--');
    }
    this.stringifyHunk(result, hunks[i], withLineNumbers, width);
  }
  return result;
};

module.exports = ConsolePrinter;
