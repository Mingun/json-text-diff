'use strict';

function needOutput(changes, i) {
  return i < changes.length ? changes[i].kind !== ' ' : false;
}

function toHunks(changes, context) {
  if (context === undefined) { context = 4; }

  let lookahead = Array.from({ length: context }, (_, i) => needOutput(changes, i + 1));
  let lookatail = Array(context).fill(false);
  let lines = [];// list of lines to include in hunk
  let hunks = [];
  let lastInclude = false;

  // Line counters
  let oldLine = 0;
  let newLine = 0;
  let oldLines = 0;
  let newLines = 0;

  for (let i = 0; i < changes.length; ++i) {
    let kind = changes[i].kind;
    let hasChange = kind !== ' ';
    let include = hasChange || lookahead.some(x => x) || lookatail.some(x => x);

    if (kind !== '+') { ++oldLine; }
    if (kind !== '-') { ++newLine; }

    if (include) {
      if (kind !== '+') { ++oldLines; }
      if (kind !== '-') { ++newLines; }

      lines.push(changes[i]);
    } else
    if (include !== lastInclude) {
      hunks.push({
        oldStart: oldLine - oldLines, oldLines,
        newStart: newLine - newLines, newLines,
        lines
      });
      lines = [];
      oldLines = 0;
      newLines = 0;
    }
    lookahead[i % context] = needOutput(changes, i + 1 + context);
    lookatail[i % context] = hasChange;
    lastInclude = include;
  }
  if (lines.length !== 0) {
    hunks.push({
      oldStart: oldLine - oldLines + 1, oldLines,
      newStart: newLine - newLines + 1, newLines,
      lines
    });
  }
  return hunks;
}

module.exports = toHunks;
