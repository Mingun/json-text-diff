'use strict';

let wordDiff = require('./word-diff');

let push = Array.prototype.push;

function split(value) {
  let tokens = value.split(/\n|\r\n/);
  // Ignore the final empty token that occurs if the string ends with a new line
  if (!tokens[tokens.length - 1]) {
    tokens.pop();
  }
  return tokens;
}

function fillInlineChanges(result, del, ins) {
  let inlineDiff = wordDiff.diff(
    del.join('\n'),
    ins.join('\n')
  );

  // Changes in each line
  let changes = [[]];
  for (let change of inlineDiff) {
    /* eslint-disable no-inner-declarations */
    function asChange(line) {
      if (change.added)   { return { kind: '+', value: line }; }
      if (change.removed) { return { kind: '-', value: line }; }
      return { kind: ' ', value: line };
    }
    /* eslint-enable no-inner-declarations */

    change.value.split('\n').forEach((line, i) => {
      if (i !== 0) { changes.push([]); }
      if (line.length === 0) { return; }

      changes[changes.length - 1].push(asChange(line));
    });
  }

  for (let change of changes) {
    if (change.length === 1) {
      result.push(change[0]);
    } else
    if (change.length > 0) {
      result.push({ kind: '?', changes: change });
    }
  }
}

/**
 * Converts diff from `diff` library format to format that can be used to output in inline mode.
 *
 * @api private
 * @param {Object[]} lines Array with changes
 * @return {Object[]} Array with inline changes of each line
 */
function inline(lines) {
  let result = [];
  let del = [];// texts of deleted lines
  let ins = [];// texts of inserted lines
  let lastKind = ' ';
  for (let line of lines) {
    let kind = line.added ? '+' : (line.removed ? '-' : ' ');
    let text = split(line.value);

    if (line.removed) {
      push.apply(del, text);
    } else
    if (line.added) {
      push.apply(ins, text);
    } else {
      if (kind !== lastKind) {
        fillInlineChanges(result, del, ins);
        del = [];
        ins = [];
      }
      for (let t of text) {
        result.push({ kind: kind, value: t });
      }
    }
    lastKind = kind;
  }
  if (del.length > 0 || ins.length > 0) {
    fillInlineChanges(result, del, ins);
  }

  return result;
}

module.exports = inline;
