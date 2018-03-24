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

function fill(result, kind, arr) {
  for (let changes of arr) {
    // Merge consecutive elements with the same kind
    let prev;
    changes = changes.reduce((acc, change) => {
      if (prev && prev.kind === change.kind) {
        prev.value += change.value;
      } else {
        acc.push(change);
      }
      prev = change;

      return acc;
    }, []);

    if (changes.length === 1) {
      result.push({ kind: kind, value: changes[0].value });
    } else
    if (changes.length > 0) {
      result.push({ kind: kind, changes: changes });
    }
  }
}

function append(arr, i, inlineChange) {
  if (i !== 0) { arr.push([]); }
  if (inlineChange.value.length === 0) { return; }

  arr[arr.length - 1].push(inlineChange);
}

function fillInlineChanges(result, del, ins, indent) {
  let inlineDiff = wordDiff.diff(
    del.join('\n'),
    ins.join('\n'),
    { indent }
  );

  // Changes in each line
  let delChanges = [[]];
  let insChanges = [[]];
  for (let change of inlineDiff) {
    /* eslint-disable no-inner-declarations */
    function asChange(line) {
      if (change.added)   { return { kind: '+', value: line }; }
      if (change.removed) { return { kind: '-', value: line }; }
      return { kind: ' ', value: line };
    }
    /* eslint-enable no-inner-declarations */

    change.value.split('\n').forEach((line, i) => {
      if (!change.added) {
        append(delChanges, i, asChange(line));
      }
      if (!change.removed) {
        append(insChanges, i, asChange(line));
      }
    });
  }

  fill(result, '-', delChanges);
  fill(result, '+', insChanges);
}

function unified(lines, indent) {
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
        fillInlineChanges(result, del, ins, indent);
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
    fillInlineChanges(result, del, ins, indent);
  }
  return result;
}

module.exports = unified;
