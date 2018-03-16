'use strict';

let textDiff = require('diff');
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
    if (changes.length === 1) {
      result.push({ kind: kind, value: changes[0].value });
    } else
    if (changes.length > 0) {
      result.push({ kind: kind, changes: changes });
    }
  }
}

function append(arr, i, inlineChange) {
  if (i === 0) {
    arr[arr.length - 1].push(inlineChange);
  } else {
    arr.push([inlineChange]);
  }
}

function fillChanges(result, del, ins) {
  let inlineDiff = wordDiff.diff(
    del.join('\n'),
    ins.join('\n')
  );

  // Changes in each line
  let delChanges = [[]];
  let insChanges = [[]];
  for (let change of inlineDiff) {
    if (change.value.length === 0) {
      continue;
    }
    /* eslint-disable no-inner-declarations */
    function asChange(line) {
      if (change.added)   { return { kind: '+', value: line }; }
      if (change.removed) { return { kind: '-', value: line }; }
      return { kind: ' ', value: line };
    }
    /* eslint-enable no-inner-declarations */

    change.value.split('\n').forEach((line, i) => {
      if (line.length === 0) { return; }

      line = asChange(line);
      if (!change.added) {
        append(delChanges, i, line);
      }
      if (!change.removed) {
        append(insChanges, i, line);
      }
    });
  }

  fill(result, '-', delChanges);
  fill(result, '+', insChanges);
}

function convert(lines) {
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
        fillChanges(result, del, ins);
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
    fillChanges(result, del, ins);
  }
  return result;
}

/**
 * Creates diffs for given error by comparing `expected` and `actual` converted to strings.
 *
 * @api public
 * @param {String} expected Base string which will be show as removed part of diff
 * @param {String} actual New string which will be showed as added part of diff
 * @return {Object} Generated structured diff
 */
function generateDiff(expected, actual) {
  return convert(textDiff.diffLines(expected, actual));
}

module.exports = generateDiff;
