'use strict';

function equals(del, ins) {
  if (del === ins) { return true; }
  if (del.kind === ins.kind
   || del.kind === '?' && ins.kind !== '+'
   || ins.kind === '?' && del.kind !== '-'
  ) {
    return del.value === ins.value;
  }
  return false;
}

function mergeLine(delChanges, insChanges) {
  let result = [];
  let i = 0;
  let j = 0;

  for (; i < delChanges.length && j < insChanges.length;) {
    let del = delChanges[i];
    let ins = insChanges[j];

    if (equals(del, ins)) {
      if (del.kind === '?') { del.kind = ' '; }
      result.push(del);
      ++i;
      ++j;
      continue;
    }
    if (del.kind !== ' ' && del.kind !== 'n') {
      if (del.kind === '?') { del.kind = '-'; }
      result.push(del);
      ++i;
      continue;
    }
    if (ins.kind !== ' ' && ins.kind !== 'n') {
      if (ins.kind === '?') { ins.kind = '+'; }
      result.push(ins);
      ++j;
      continue;
    }
    if (del.kind === 'n') {
      result.push(del);
      ++i;
      continue;
    }
    // istanbul ignore else
    if (ins.kind === 'n') {
      result.push(ins);
      ++j;
      continue;
    }
    // istanbul ignore next
    throw new Error('must be unreachable', { i, del, j, ins });
  }
  for (; i < delChanges.length; ++i) {
    let del = delChanges[i];
    if (del.kind === '?') { del.kind = '-'; }
    result.push(del);
  }
  for (; j < insChanges.length; ++j) {
    let ins = insChanges[j];
    if (ins.kind === '?') { ins.kind = '+'; }
    result.push(ins);
  }
  return result;
}

function finish(lines, changes) {
  if (changes.length === 1) {
    lines.push(changes[0]);
  } else {
    lines.push({ kind: '?', changes });
  }
}

function mergeLines(lines, del, ins) {
  let merged = mergeLine(del, ins);
  let changes = [];
  for (let change of merged) {
    if (change.kind === 'n') {
      finish(lines, changes);
      changes = [];
      continue;
    }
    changes.push(change);
  }
}

let push = Array.prototype.push;

/**
 * Converts diff from unified format to format that can be used to output in inline mode.
 *
 * @api public
 * @param {Object[]} changes Array with changes of each line (inserted, removed or unchanged)
 * @return {Object[]} Array with inline changes of each line
 */
function toInline(changes) {
  let lines = [];
  let del = [];// inline changes of text of deleted lines
  let ins = [];// inline changes of text of inserted lines
  let lastKind = ' ';
  for (let change of changes) {
    let kind = change.kind;

    if (kind === '-') {
      if (change.changes) {
        push.apply(del, change.changes);
      } else {
        del.push({ kind: '?', value: change.value });
      }
      del.push({ kind: 'n' });// newline
    } else
    if (kind === '+') {
      if (change.changes) {
        push.apply(ins, change.changes);
      } else {
        ins.push({ kind: '?', value: change.value });
      }
      ins.push({ kind: 'n' });// newline
    } else {
      if (kind !== lastKind) {
        mergeLines(lines, del, ins);
        del = [];
        ins = [];
      }
      lines.push(change);
    }
    lastKind = kind;
  }
  if (del.length > 0 || ins.length > 0) {
    mergeLines(lines, del, ins);
  }
  return lines;
}

module.exports = toInline;
