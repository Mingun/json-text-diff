'use strict';

let toHunks = require('../../lib/hunk');
let ConsolePrinter = require('./console-printer');

class UnifiedDiff extends ConsolePrinter {
  constructor(color, indent) {
    super(color, indent);
  }

  text(line) {
    return line.kind + (line.changes
      ? line.changes.map(change => {
        if (change.kind === '+') { return this.colors.inlineIns(change.value); }
        if (change.kind === '-') { return this.colors.inlineDel(change.value); }
        return change.value;
      }).join('')
      : line.value
    );
  }

  colorize(line) {
    if (line.kind === '+') { return this.colors.ins(this.text(line)); }
    if (line.kind === '-') { return this.colors.del(this.text(line)); }
    return line.kind + line.value;
  }

  /**
   * Converts a unified diff between two strings to coloured text representation.
   *
   * @api public
   * @param {Object} hunks Structured differences of actual from expected
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

    return '\n' +
      this.indent + this.colors.del('- expected') + ' ' + this.colors.inlineDel('(removed piece)') + '\n' +
      this.indent + this.colors.ins('+ actual')   + ' ' + this.colors.inlineIns('(added piece)')   + '\n' +
      '\n' +
      lines.join('\n');
  }
}

module.exports = UnifiedDiff;
