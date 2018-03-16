'use strict';

let diff    = require('../lib/object');
let toHunks = require('../lib/hunk');

let chai    = require('chai');
let expect = chai.expect;

function hunk(expected, actual, context) {
  return toHunks(diff(expected, actual), context);
}

describe('hunks', function() {
  it('generates hunks', function() {
    expect(hunk('foo', 'foo')).to.deep.equals([]);
    expect(hunk('foo', 'bar')).to.deep.equals([{
      oldStart: 1, oldLines: 1,
      newStart: 1, newLines: 1,
      lines: [
        { kind: '-', value: 'foo' },
        { kind: '+', value: 'bar' }
      ]
    }]);
  });

  describe('use specified line count for context', function() {
    let expected = 'A long time ago in a galaxy far, far away.... (actually not so far)'.split(' ').join('\n');
    let actual   = 'A not so long time ago in a galaxy far, far away....'.split(' ').join('\n');

    it('when `context` not defined use 4 lines of context', function() {
      expect(hunk(expected, actual)).to.deep.equals(hunk(expected, actual, 4));
    });

    it('when `context` is defined use specified value', function() {
      expect(hunk(expected, actual, 4)).to.deep.equals([
        {
          oldStart: 1, oldLines: 14,
          newStart: 1, newLines: 12,
          lines: [
            { kind: ' ', value: 'A' },
            { kind: '+', value: 'not' },
            { kind: '+', value: 'so' },
            { kind: ' ', value: 'long' },
            { kind: ' ', value: 'time' },
            { kind: ' ', value: 'ago' },
            { kind: ' ', value: 'in' },
            { kind: ' ', value: 'a' },
            { kind: ' ', value: 'galaxy' },
            { kind: ' ', value: 'far,' },
            { kind: ' ', value: 'far' },
            { kind: '-', value: 'away....' },
            { kind: '-', value: '(actually' },
            { kind: '-', value: 'not' },
            { kind: '-', value: 'so' },
            { kind: '-', value: 'far)' },
            { kind: '+', value: 'away....' },
          ]
        },
      ]);

      expect(hunk(expected, actual, 2)).to.deep.equals([
        {
          oldStart: 1, oldLines: 3,
          newStart: 1, newLines: 5,
          lines: [
            { kind: ' ', value: 'A' },
            { kind: '+', value: 'not' },
            { kind: '+', value: 'so' },
            { kind: ' ', value: 'long' },
            { kind: ' ', value: 'time' },
          ]
        },
        {
          oldStart:  8, oldLines: 7,
          newStart: 10, newLines: 3,
          lines: [
            { kind: ' ', value: 'far,' },
            { kind: ' ', value: 'far' },
            { kind: '-', value: 'away....' }, // NOTE: Fix this sub-optimal diff. Maybe problem in `jsdiff` module
            { kind: '-', value: '(actually' },
            { kind: '-', value: 'not' },
            { kind: '-', value: 'so' },
            { kind: '-', value: 'far)' },
            { kind: '+', value: 'away....' },
          ]
        },
      ]);
    });

    it('when `context` is set to 0 returns only changed lines', function() {
      expect(hunk(expected, actual, 0)).to.deep.equals([
        {
          oldStart: 2, oldLines: 0,
          newStart: 2, newLines: 2,
          lines: [
            { kind: '+', value: 'not' },
            { kind: '+', value: 'so' },
          ]
        },
        {
          oldStart: 10, oldLines: 5,
          newStart: 12, newLines: 1,
          lines: [
            { kind: '-', value: 'away....' },
            { kind: '-', value: '(actually' },
            { kind: '-', value: 'not' },
            { kind: '-', value: 'so' },
            { kind: '-', value: 'far)' },
            { kind: '+', value: 'away....' },
          ]
        },
      ]);
    });
  });
});
