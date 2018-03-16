'use strict';

let diff     = require('../lib/object');
let toInline = require('../lib/inline');
let toHunks  = require('../lib/hunk');

let chai   = require('chai');
let expect = chai.expect;

describe('hunk module', function() {
  for (let inline of [false, true]) {
    /* eslint-disable no-inner-declarations */
    function hunk(expected, actual, context) {
      let d = diff(expected, actual);
      return toHunks(inline ? toInline(d) : d, context);
    }
    /* eslint-enable no-inner-declarations */

    describe('in ' + (inline ? 'inline' : 'unified') + ' mode', function() {
      it('generates hunks', function() {
        expect(hunk('foo', 'foo')).to.deep.equals([]);
        expect(hunk('foo', 'bar')).to.deep.equals([{
          oldStart: 1, oldLines: 1,
          newStart: 1, newLines: 1,
          lines: inline
          /* eslint-disable indent-legacy */
            ? [
                { kind: '?',
                  changes: [
                    { kind: '-', value: 'foo' },
                    { kind: '+', value: 'bar' }
                  ]
                }
              ]
            : [
                { kind: '-', value: 'foo' },
                { kind: '+', value: 'bar' },
              ]
          /* eslint-enable indent-legacy */
        }]);
      });

      describe('use specified line count for context', function() {
        let expected = 'A long time ago in a galaxy far, far away.... (actually not so far)'.split(' ').join('\n');
        let actual   = 'A not so long time ago in a galaxy far, far away....'.split(' ').join('\n');

        it('when `context` not defined use 4 lines of context', function() {
          expect(hunk(expected, actual)).to.deep.equals(hunk(expected, actual, 4));
        });

        it('when `context` is defined use specified value', function() {
          let lines1 = [
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
            { kind: ' ', value: 'away....' },
            { kind: '-', value: '(actually' },
            { kind: '-', value: 'not' },
            { kind: '-', value: 'so' },
            { kind: '-', value: 'far)' },
          ];
          let lines2 = [
            { kind: ' ', value: 'far' },
            { kind: ' ', value: 'away....' },
            { kind: '-', value: '(actually' },
            { kind: '-', value: 'not' },
            { kind: '-', value: 'so' },
            { kind: '-', value: 'far)' },
          ];
          // NOTE: Fix this sub-optimal diff. Maybe problem in `jsdiff` module
          let offset = 0;
          if (!inline) {
            lines1[11].kind = '-';
            lines1.push({ kind: '+', value: 'away....' });

            lines2[1].kind = '-';
            lines2.splice(0, 0, { kind: ' ', value: 'far,' });
            lines2.push({ kind: '+', value: 'away....' });
            offset = 1;
          }

          expect(hunk(expected, actual, 5)).to.deep.equals([
            {
              oldStart: 1, oldLines: 14,
              newStart: 1, newLines: 12,
              lines: lines1
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
              oldStart:  9 - offset, oldLines: 6 + offset,
              newStart: 11 - offset, newLines: 2 + offset,
              lines: lines2
            },
          ]);
        });

        it('when `context` is set to 0 returns only changed lines', function() {
          let lines = [
            { kind: '-', value: '(actually' },
            { kind: '-', value: 'not' },
            { kind: '-', value: 'so' },
            { kind: '-', value: 'far)' },
          ];
          // NOTE: Fix this sub-optimal diff. Maybe problem in `jsdiff` module
          let offset = 0;
          if (!inline) {
            lines.splice(0, 0, { kind: '-', value: 'away....' });
            lines.push({ kind: '+', value: 'away....' });
            offset = 1;
          }

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
              oldStart: 11 - offset, oldLines: 4 + offset,
              newStart: 13 - offset, newLines: 0 + offset,
              lines: lines
            },
          ]);
        });
      });
    });
  }
});
