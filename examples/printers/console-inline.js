'use strict';

let convert = require('../../lib/inline');
let toHunks = require('../../lib/hunk');
let ConsolePrinter = require('./console-printer');

class InlineDiff extends ConsolePrinter {
  constructor(color, indent) {
    super(color, indent);
  }

  /**
   * Colorize each inline change in the line.
   *
   * @param {Object} change Change for colorize
   * @return {string} Colorized string
   */
  colorizeChange(change) {
    if (change.kind === '+') { return this.colors.ins(change.value); }
    if (change.kind === '-') { return this.colors.del(change.value); }
    return change.value;
  }

  colorize(line) {
    switch (line.kind) {
      case ' ': return line.value;
      case '+': return this.colors.ins(line.value);
      case '-': return this.colors.del(line.value);
      case '?': {
        let changes = line.changes;
        for (let i = 0; i < changes.length; ++i) {
          changes[i] = this.colorizeChange(changes[i]);
        }
        return changes.join('');
      }
      default: throw new Error('Unknown line.kind: ' + line.kind);
    }
  }

  /**
   * Converts an inline diff between two strings to coloured text representation.
   *
   * @api public
   * @param {Object} hunks Structured differences actual from expected
   * @param {number?} context Count of context lines befor and after changed lines in diff output.
   *        If not specified or negative, output all lines (infinity count of context lines)
   * @return {string} The diff for output to the console.
   */
  print(hunks) {
    let last  = hunks[hunks.length - 1];
    let count = Math.max(last.oldStart + last.oldLines, last.newStart + last.newLines);
    let width = String(count).length;
    let lines = this.stringify(hunks, count > 4, width);

    lines.push('');

    return '\n' + this.indent +
      this.colors.del('expected') + ' ' +
      this.colors.ins('actual') +
      '\n\n' +
      lines.join('\n');
  }
}

module.exports = InlineDiff;
