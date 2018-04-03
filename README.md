[![Build Status](https://img.shields.io/travis/Mingun/structured-diff.svg?label=travis)](https://travis-ci.org/Mingun/structured-diff)
[![Coverage Status](https://coveralls.io/repos/github/Mingun/structured-diff/badge.svg?branch=master)](https://coveralls.io/github/Mingun/structured-diff?branch=master)
[![npm](https://img.shields.io/npm/v/structured-diff.svg)](https://www.npmjs.com/package/structured-diff)
[![License](https://img.shields.io/badge/license-mit-blue.svg)](https://opensource.org/licenses/MIT)
[![BrowserStack Status](https://www.browserstack.com/automate/badge.svg?badge_key=cHhBYit2dm5uWUNjVEdoV3doWUgwL0VoUHpRd2o5MzBtNjB2Z1hmSVQ5WT0tLVFrelFQeHgyN3RZVlEydVM0bThkRWc9PQ==--62876d2d36d97880924c4aca255a90fd60bbb18d)](https://www.browserstack.com/automate/public-build/cHhBYit2dm5uWUNjVEdoV3doWUgwL0VoUHpRd2o5MzBtNjB2Z1hmSVQ5WT0tLVFrelFQeHgyN3RZVlEydVM0bThkRWc9PQ==--62876d2d36d97880924c4aca255a90fd60bbb18d)

# structured-diff
Generates structurual diffs for two JS objects. Objects can have circular references.

The first of all purpose of library -- to create nice diffs for assertion libraries.

## Installation
```
npm install structured-diff
```

## Usage
```js
let api = require('structured-diff');

let objectDiff = api.generateDiff(
  { some: 'foo', object: true },
  { object: 'is', cool: ['yes', true] }
);
// or
let stringDiff = new api.Diff('some string', 'another string');

// Get unified diff with inline diffs in each line with 4 lines of context
// before and after changed lines
let unified = objectDiff.unified(4);

// Get inline diff with 4 lines of context before and after changed lines
let inline  = stringDiff.inline(4);
```
`diff` has format describing by [JSON Schemas](https://github.com/Mingun/structured-diff/tree/master/schemas).
Also see [Diff format](#diff-format) section.

Also see [examples](https://github.com/Mingun/structured-diff/tree/master/examples).

## API
Module exports object with one function and one class for generating diffs:

### Class `Diff`

#### `constructor(expected: String, actual: String[, options: Object])`

Creates diffs by comparing `expected` and `actual`. Both parameters must be strings.

**Parameters**

- `expected`: Base string which will be show as removed part of diff
- `actual`: New string which will be showed as added part of diff
- `options`: Options for diff algorithm. Optional parameter, defaults to `{}`. Supported options:
  - `ignoreWhitespace` (type: `boolean`, default: `false`): ignores whitespace changes in lines;
  - `newlineIsToken` (type: `boolean`, default: `false`): if `true`, each symbol `\n` or sequence
    `\r\n` considered as separate token, otherwise it includes as part in preceding token;
  - `ignoreCase` (type: `boolean`, default: `false`): if `true`, tokens are compared case-insensitive;
  - `comparator` (type: `function(String, String) -> boolean`, default: `undefined`): function for
    comparing tokens, must return `-1`, `0`, or `1` if first token less then, equals or
    greater then second accordingly;
  - `hint` (type: `Object|string`, default: `undefined`): the hint to diff algorithm with what
    type of objects it works. Can be or string with type name or object `{ type: string, ... }`
    with type and additional options dependent on type. For now only one type is known with
    one additional option:
    - `{ type: 'json', indent: Number }`. Parameter `indent` specify indentation size, used
      for JSON stringification. This hint will be used by diff algorithm for produce nice
      output in differences in indents

#### `unified([context: Number]) -> Object[]`<br/>`inline ([context: Number]) -> Object[]`

Converts `Diff` object to array with hunks or lines, depending on presence of the `context`
parameter. If the `context` is `undefined` then method returns an array, each element of which
represents one line of the text. The text is divided into lines by `\n` symbol or `\r\n`
sequence. Otherwise array contains hunks with only changed lines and specified number of context
lines before and after changed lines. In particular, if `context===0`, each hunk contains only
the changed lines.

If `context===null` then method returns one hunk with all lines if there exist some changes and
empty array otherwise. It differs from behavior if `context` is `undefined` -- in this case
the array of all lines always returns even if there are no changes.

Each line for `unified` method represented by the following object:
```js
{ kind: ' /+/-', value: 'line value' }
// or
{ kind: '+/-', changes: [{ kind: ' /+/-', value: 'part of string' }] }
```
where

- `kind`: one of `' '`, `'+'` or `'-'`. Represents kind of change -- line not changed (context
  line), line added in `actual` or line is removed in `actual`;
- `value`: contains line text; for the changed lines existence of this property means that in them
  there are no inline differences, otherwise object contains property `changes`. Context lines
  always contains only that property;
- `changes`: array of objects represents inline changes in the line. This property is used instead
  of `value` property for lines with inline differences. Each array element is object with following
  structure:
  - `kind`: one of `' '`, `'+'` or `'-'`. Represents kind of change -- piece not changed, piece
    added or removed;
  - `value`: string contains part of text that the same in `expected` and `actual`, added or removed
    within line.

Each line for `inline` method represented by the following object:
```js
{ kind: ' /+/-/?', value: 'line value' }
// or
{ kind: '+/-', changes: [ { kind: ' /+/-', value: 'part of string' }] }
```
where

- `kind`: one of `' '`, `'+'`, `'-'` or `'?'`. Represents kind of change -- line not changed (context
  line), line added in `actual`, line is removed in `actual`, line contains inline differences;
- `value`: for all kinds except `'?'`, contains line text; for the `kind = '?'` object contains
  property `changes` instead of this property;
- `changes`: array of objects represents inline changes in the line. This property is used only for
  `kind = '?'` instead of `value` property. Each array element is object with following structure:
  - `kind`: one of `' '`, `'+'` or `'-'`. Represents kind of change -- piece not changed, piece
    added or removed;
  - `value`: string contains part of text that the same in `expected` and `actual`, added or removed
    within line.

Each hunk in both method results represented by the following object:
```js
{
  oldStart: <Number>, oldLines: <Number>,
  newStart: <Number>, newLines: <Number>,
  lines: <array of Line objects described above>
}
```

`oldStart` represents line number (starts with 1) when the hunk is begin in `expected` string and
`oldLines` represents all lines in the hunk that come from `expected` (context lines and removed lines).

`newStart` and `newLines` represents the same things in the `actual` string, but `newLines` count
context lines and added lines.

**Parameters**

- `context`: Number of unchanged lines to include in result around changed lines (specified count
  applied to lines below and above changed lines, so 2 means up to 4 context lines)

**Returns**: See description

### `generateDiff(expected: Object, actual: Object[, options: Object]) -> Diff`

Creates diffs by comparing `expected` and `actual` converted to strings.

If both `expected` and `actual` are already strings, then the behavior is the same as
`new Diff(expected, actual, options)`. Otherwise both objects will be converted to strings
with use of the stable algorithm working with circular references. At the moment stringification
performed with [safe-stable-stringify](https://github.com/BridgeAR/safe-stable-stringify). This
is optional dependency so you can use this method only if it is installed, otherwise method
throw `Error`.

**Parameters**

- `expected`: `Object`, Base object which will be show as removed part of diff
- `actual`: `Object`, New object which will be showed as added part of diff

**Returns**: `Object[]`, Array with one `change` element for each line of text diff between
stringified representation of compared objects. Each `change` object can also have information
about inline differences.

## Diff format
In both diff formats deletions appears before insertions in changed parts.
### Unified
Function `Diff.unified` returns array when each element describes one line in unified diff output.
Description of format also available as [JSON Schema v7](https://github.com/Mingun/structured-diff/blob/master/schemas/unified.schema.json).

Each array element has `kind` property:
- `' '` -- line not changed (the same in both sides). Line content in the `value` property
- `'-'` -- line is removed (line is exist in `expected` and missing in `actual`).
  Line content or in `value` or in `changes` property
- `'+'` -- line is inserted (line is missing in `expected` and exist in `actual`).
  Line content or in `value` or in `changes` property

When line kind is `+` or `-`, line content can have inline changes.
Inline changes stored in the property `changes` as array of `inlineChange` object with properties `kind` and `value`.
Each `value` always string with part of line content and `kind` property has values:
- `' '` -- this part of line not changed (the same in both sides)
- `'-'` -- this part of line is removed (is exist in `expected` and missing in `actual`)
- `'+'` -- this part of line is inserted (is missing in `expected` and exist in `actual`)

When line do not have inline changes it can contains property `value` instead of `changes` with string with all line content.

For example from [Usage](#usage) section the following diff will be generated (variable `unified`):
```js
[
  { kind: ' ', value: '{' },
  {
    kind: '-',
    changes: [
      { kind: ' ', value: '  "' },
      { kind: '-', value: 'some' },
      { kind: ' ', value: '": "' },
      { kind: '-', value: 'foo' },
      { kind: ' ', value: '"' }
    ]
  },
  {
    kind: '-',
    changes: [
      { kind: ' ', value: '  "' },
      { kind: '-', value: 'object' },
      { kind: ' ', value: '": ' },
      { kind: ' ', value: 'true' }
    ]
  },
  {
    kind: '+',
    changes: [
      { kind: ' ', value: '  "' },
      { kind: '+', value: 'object' },
      { kind: ' ', value: '": "' },
      { kind: '+', value: 'is' },
      { kind: ' ', value: '"' }
    ]
  },
  {
    kind: '+',
    changes: [
      { kind: ' ', value: '  "' },
      { kind: '+', value: 'cool' },
      { kind: ' ', value: '": ' },
      { kind: '+', value: '[' }
    ]
  },
  { kind: '+', value: '    "yes"' },
  {
    kind: '+',
    changes: [
      { kind: '+', value: '    ' },
      { kind: ' ', value: 'true' }
    ]
  },
  { kind: '+', value: '  ]' },
  { kind: ' ', value: '}' }
]
```

### Inline
Function `Diff.inline` returns array when each element describes one line in inline diff output.
Description of format also available as [JSON Schema v7](https://github.com/Mingun/structured-diff/blob/master/schemas/inline.schema.json).

Each array element has `kind` property:
- `' '` -- line not changed (the same in both sides). Line content in the `value` property
- `'-'` -- line is removed (line is exist in `expected` and missing in `actual`).
  Line content in the `value` property
- `'+'` -- line is inserted (line is missing in `expected` and exist in `actual`).
  Line content in the `value` property
- `'?'` -- line exists in both sides but not identical. Line content in the `changes` property

When line kind is `?`, line content has inline changes.
Inline changes stored in the property `changes` as array of `inlineChange` object with properties `kind` and `value`.
Each `value` always string with part of line content and `kind` property has values:
- `' '` -- this part of line not changed (the same in both sides)
- `'-'` -- this part of line is removed (is exist in `expected` and missing in `actual`)
- `'+'` -- this part of line is inserted (is missing in `expected` and exist in `actual`)

For example from [Usage](#usage) section the following diff will be generated (variable `inline`):
```js
[
  {
    kind: '?',
    changes: [
      { kind: '-', value: 'some' },
      { kind: '+', value: 'another' },
      { kind: ' ', value: ' string' }
    ]
  }
]
```
