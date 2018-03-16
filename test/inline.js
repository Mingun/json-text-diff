'use strict';

let diff     = require('../lib/object');
let toInline = require('../lib/inline');

let chai = require('chai');
let expect = chai.expect;

function inline(expected, actual) {
  return toInline(diff(expected, actual));
}

describe('inline', function() {
  it('merge changes from changed lines', function() {
    expect(inline('foo', 'bar')).to.deep.equals([
      { kind: '?',
        changes: [
          { kind: '-', value: 'foo' },
          { kind: '+', value: 'bar' },
        ]
      }
    ]);
  });

  it('merge changes from changed multiply lines', function() {
    let expected = 'A long time ago|in a galaxy far,|far away.... (actually not so far)'.split('|').join('\n');
    let actual   = 'A not so long time ago|in a galaxy far,|far away....'.split('|').join('\n');

    expect(inline(expected, actual)).to.deep.equals([
      { kind: '?',
        changes: [
          { kind: ' ', value: 'A ' },
          { kind: '+', value: 'not so ' },
          { kind: ' ', value: 'long time ago' },
        ]
      },
      { kind: ' ', value: 'in a galaxy far,' },
      { kind: '?',
        changes: [
          { kind: ' ', value: 'far away....' },
          { kind: '-', value: ' (actually not so far)' },
        ]
      },
    ]);
  });
});
