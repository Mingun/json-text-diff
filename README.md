[![Build Status](https://img.shields.io/travis/Mingun/structured-diff.svg?label=travis)](https://travis-ci.org/Mingun/structured-diff)
[![Coverage Status](https://coveralls.io/repos/github/Mingun/structured-diff/badge.svg?branch=master)](https://coveralls.io/github/Mingun/structured-diff?branch=master)
[![npm](https://img.shields.io/npm/v/structured-diff.svg)](https://www.npmjs.com/package/structured-diff)
[![License](https://img.shields.io/badge/license-mit-blue.svg)](https://opensource.org/licenses/MIT)

# structured-diff
Generates structurual diffs for two JS objects. Objects can have circular references.

## Installation
```
npm install structured-diff
```

## Usage
```js
let generateDiff = require('structured-diff');

let diff = generateDiff(
  { some: 'foo', object: true },
  { object: 'is', cool: ['yes', true] }
);
```
`diff` has format describing by [JSON Schema](https://github.com/Mingun/structured-diff/blob/master/diff.schema.json).
Also see [Diff format](#diff-format) section.

Also see [examples](https://github.com/Mingun/structured-diff/tree/master/examples).

## API
Module exports one function for generating diffs:

### `generateDiff(expected, actual)`

Creates diffs by comparing `expected` and `actual` converted to strings.
Stringification performed with [json-stringify-safe](https://github.com/moll/json-stringify-safe)

**Parameters**

- expected: `Object`, Base object which will be show as removed part of diff
- actual: `Object`, New object which will be showed as added part of diff

**Returns**: `Object[]`, Array with one `change` element for each line of text diff between
stringified representation of compared objects. Each `change` object can also have information
about inline differences.

## Diff format
Function returns array when each element describes one line in unified diff output.
Description of format also available as [JSON Schema](https://github.com/Mingun/structured-diff/blob/master/diff.schema.json).

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

For example from [usage](#usage) section the following diff will be generated:
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
