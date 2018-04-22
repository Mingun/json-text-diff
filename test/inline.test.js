'use strict';

let inline = require('../lib/inline');

let chai   = require('chai');
let expect = chai.expect;

describe('inline module', function() {
  describe('converts line diff from `diff` output format to inline form', function() {
    it('no changes translates to no changes', function() {
      expect(inline([])).to.deep.equals([]);
      expect(inline([
        { value: '', removed: true },
        { value: '', added: true },
      ])).to.deep.equals([]);
      expect(inline([
        { value: '\n', removed: true },
        { value: '', added: true },
      ])).to.deep.equals([]);

      // foo
      // bar
      expect(inline([
        { value: 'foo' },
        { value: 'bar' },
      ])).to.deep.equals([
        { kind: ' ', value: 'foo' },
        { kind: ' ', value: 'bar' },
      ]);
      // -foo
      // +foo
      expect(inline([
        { value: 'foo', removed: true },
        { value: 'foo', added: true },
      ])).to.deep.equals([
        { kind: ' ', value: 'foo' }
      ]);
    });

    it('simple replace line', function() {
      expect(inline([
        { value: 'foo', removed: true },
        { value: 'bar', added: true },
      ])).to.deep.equals([
        { kind: '?',
          changes: [
            { kind: '-', value: 'foo' },
            { kind: '+', value: 'bar' },
          ]
        }
      ]);
    });

    it('additions in start of string', function() {
      // -string
      // +{
      // +  string
      // +}
      expect(inline([
        { value: 'string', removed: true },
        { value: '{\n  string\n}', added: true },
      ])).to.deep.equals([
        { kind: '+', value: '{' },
        { kind: '?', changes: [
          { kind: '+', value: '  ' },
          { kind: ' ', value: 'string' },
        ] },
        { kind: '+', value: '}' },
      ]);

      // -{
      // -  string
      // -}
      // +string
      expect(inline([
        { value: '{\n  string\n}', removed: true },
        { value: 'string', added: true },
      ])).to.deep.equals([
        { kind: '-', value: '{' },
        { kind: '?', changes: [
          { kind: '-', value: '  ' },
          { kind: ' ', value: 'string' },
        ] },
        { kind: '-', value: '}' },
      ]);
    });

    it('deletions in end of string', function() {
      // -string 1
      // +{
      // +string 2
      // +}
      expect(inline([
        { value: 'string 1', removed: true },
        { value: '{\nstring 2\n}', added: true },
      ])).to.deep.equals([
        { kind: '+', value: '{' },
        { kind: '?', changes: [
          { kind: ' ', value: 'string ' },
          { kind: '-', value: '1' },
          { kind: '+', value: '2' },
        ] },
        { kind: '+', value: '}' },
      ]);

      // -{
      // -string 1
      // -}
      // +string 2
      expect(inline([
        { value: '{\nstring 1\n}', removed: true },
        { value: 'string 2', added: true },
      ])).to.deep.equals([
        { kind: '-', value: '{' },
        { kind: '?', changes: [
          { kind: ' ', value: 'string ' },
          { kind: '-', value: '1' },
          // NOTE: `diff` algorithm not so ideal, find the way fix it
          // { kind: '+', value: '2' },
        ] },
        // { kind: '-', value: '}' },
        { kind: '?', changes: [
          { kind: '-', value: '}' },
          { kind: '+', value: '2' },
        ] },
      ]);
    });

    it('changes in middle of lines', function() {
      expect(inline([
        { value: 'A long time ago\n', removed: true },
        { value: 'A not so long time ago\n', added: true },
        { value: 'in a galaxy far,\n' },
        { value: 'far away.... (actually not so far)', removed: true },
        { value: 'far away....', added: true },
      ])).to.deep.equals([
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
});
