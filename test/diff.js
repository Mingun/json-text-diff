'use strict';

let diff   = require('../lib/object');
let schema = require('../diff.schema.json');

let chai = require('chai');
let expect = chai.expect;

chai.use(require('chai-json-schema'));
chai.use(function() {
  chai.Assertion.addMethod('diff', function(diff) {
    return new chai.Assertion(this._obj)
      .to.be.jsonSchema(schema)
      .and.deep.equals(diff);
  });
});

function simpleClone(obj) {
  if (obj !== undefined) {
    return JSON.parse(JSON.stringify(obj));
  }
  return undefined;
}

describe('structured-diff', function() {
  describe('returns object without changes for the same objects', function() {
    const SAME_OBJECTS = [
      { name: 'undefined',
        value: undefined,
        diff: [{ kind: ' ', value: 'undefined' }]
      },
      { name: 'null',
        value: null,
        diff: [{ kind: ' ', value: 'null' }]
      },
      { name: 'true',
        value: true,
        diff: [{ kind: ' ', value: 'true' }]
      },
      { name: 'false',
        value: false,
        diff: [{ kind: ' ', value: 'false' }]
      },
      { name: 'number',
        value: 123.456,
        diff: [{ kind: ' ', value: '123.456' }]
      },
      { name: 'string',
        value: 'test subject',
        diff: [{ kind: ' ', value: 'test subject' }]
      },
      { name: 'empty array',
        value: [],
        diff: [{ kind: ' ', value: '[]' }]
      },
      { name: 'non-empty array',
        value: ['a', 'bcdef', 42, true],
        diff: [
          { kind: ' ', value: '['         },
          { kind: ' ', value: '  "a"'     },
          { kind: ' ', value: '  "bcdef"' },
          { kind: ' ', value: '  42'      },
          { kind: ' ', value: '  true'    },
          { kind: ' ', value: ']'         },
        ]
      },
      { name: 'empty object',
        value: {},
        diff: [{ kind: ' ', value: '{}' }]
      },
      { name: 'non-empty object',
        value: { key: 'value', 42: 'answer' },
        diff: [
          { kind: ' ', value: '{'                },
          { kind: ' ', value: '  "42": "answer"' },
          { kind: ' ', value: '  "key": "value"' },
          { kind: ' ', value: '}'                },
        ]
      },
    ];
    for (let desc of SAME_OBJECTS) {
      it(desc.name, function() {
        expect(diff(desc.value, simpleClone(desc.value))).to.be.diff(desc.diff);
      });
    }
  });

  it('handle arrays with circular referencies', function() {
    function makeDiff(invert) {
      let kind1 = invert ? '+' : '-';
      let kind2 = invert ? '-' : '+';
      let part1 = [
        { kind: kind1, value: '[' },
        { kind: kind1,
          changes: [
            { kind: kind1, value: '  '         },
            { kind: ' ',   value: '"'          },
            { kind: kind1, value: '[Circular]' },
            { kind: ' ',   value: '"'          },
          ]
        },
        { kind: kind1, value: ']' },
      ];
      let part2 = [
        { kind: kind2,
          changes: [
            { kind: ' ',   value: '"'                  },
            { kind: kind2, value: 'some boring string' },
            { kind: ' ',   value: '"'                  },
          ]
        }
      ];

      return invert ? part2.concat(part1) : part1.concat(part2);
    }

    let obj = [];
    obj.push(obj);

    expect(diff(obj, 'some boring string')).to.be.diff(makeDiff(false));
    expect(diff('some boring string', obj)).to.be.diff(makeDiff(true ));
  });

  it('handle objects with circular referencies', function() {
    function makeDiff(invert) {
      let kind1 = invert ? '+' : '-';
      let kind2 = invert ? '-' : '+';
      let part1 = [
        { kind: kind1, value: '{' },
        { kind: kind1,
          changes: [
            { kind: kind1, value: '  '          },
            { kind: ' ',   value: '"'           },
            { kind: kind1, value: 'self":'      },
            { kind: ' ',   value: ' '           },
            { kind: ' ',   value: '"'           },
            { kind: kind1, value: '[Circular]"' },
          ]
        },
        { kind: kind1, value: '}' },
      ];
      let part2 = [
        { kind: kind2,
          changes: [
            { kind: ' ',   value: '"'             },
            { kind: kind2, value: 'some'          },
            { kind: ' ',   value: ' '             },
            { kind: kind2, value: 'boring string' },
            { kind: ' ',   value: '"'             },
          ]
        }
      ];

      return invert ? part2.concat(part1) : part1.concat(part2);
    }
    let obj = {};
    obj.self = obj;

    expect(diff(obj, 'some boring string')).to.be.diff(makeDiff(false));
    expect(diff('some boring string', obj)).to.be.diff(makeDiff(true ));
  });

  it('generates inline differencies', function() {
    expect(diff(
      'some foo string',
      'some bar string'
    )).to.be.diff([
      {
        kind: '-',
        changes: [
          { kind: ' ', value: 'some '   },
          { kind: '-', value: 'foo'     },
          { kind: ' ', value: ' string' },
        ]
      },
      {
        kind: '+',
        changes: [
          { kind: ' ', value: 'some '   },
          { kind: '+', value: 'bar'     },
          { kind: ' ', value: ' string' },
        ]
      },
    ]);
  });
});
