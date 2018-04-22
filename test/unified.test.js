'use strict';

let unified = require('../lib/unified');

let chai   = require('chai');
let expect = chai.expect;

describe('unified module', function() {
  describe('converts line diff from `diff` output format to unified form', function() {
    it('no changes translates to no changes', function() {
      expect(unified([])).to.deep.equals([]);
      expect(unified([
        { value: '', removed: true },
        { value: '', added: true },
      ])).to.deep.equals([]);
      expect(unified([
        { value: '\n', removed: true },
        { value: '', added: true },
      ])).to.deep.equals([]);

      // foo
      // bar
      expect(unified([
        { value: 'foo' },
        { value: 'bar' },
      ])).to.deep.equals([
        { kind: ' ', value: 'foo' },
        { kind: ' ', value: 'bar' },
      ]);
      // -foo
      // +foo
      expect(unified([
        { value: 'foo', removed: true },
        { value: 'foo', added: true },
      ])).to.deep.equals([
        { kind: '-', value: 'foo' },
        { kind: '+', value: 'foo' },
      ]);
    });

    it('simple replace line', function() {
      expect(unified([
        { value: 'foo', removed: true },
        { value: 'bar', added: true },
      ])).to.deep.equals([
        { kind: '-', value: 'foo' },
        { kind: '+', value: 'bar' },
      ]);
    });

    it('additions in start of string', function() {
      // -string
      // +{
      // +  string
      // +}
      expect(unified([
        { value: 'string', removed: true },
        { value: '{\n  string\n}', added: true },
      ])).to.deep.equals([
        { kind: '-', value: 'string' },
        { kind: '+', value: '{' },
        { kind: '+', changes: [
          { kind: '+', value: '  ' },
          { kind: ' ', value: 'string' },
        ] },
        { kind: '+', value: '}' },
      ]);

      // -{
      // -  string
      // -}
      // +string
      expect(unified([
        { value: '{\n  string\n}', removed: true },
        { value: 'string', added: true },
      ])).to.deep.equals([
        { kind: '-', value: '{' },
        { kind: '-', changes: [
          { kind: '-', value: '  ' },
          { kind: ' ', value: 'string' },
        ] },
        { kind: '-', value: '}' },
        { kind: '+', value: 'string' },
      ]);
    });

    it('deletions in end of string', function() {
      // -string 1
      // +{
      // +string 2
      // +}
      expect(unified([
        { value: 'string 1', removed: true },
        { value: '{\nstring 2\n}', added: true },
      ])).to.deep.equals([
        { kind: '-', changes: [
          { kind: ' ', value: 'string ' },
          { kind: '-', value: '1' },
        ] },
        { kind: '+', value: '{' },
        { kind: '+', changes: [
          { kind: ' ', value: 'string ' },
          { kind: '+', value: '2' },
        ] },
        { kind: '+', value: '}' },
      ]);

      // -{
      // -string 1
      // -}
      // +string 2
      expect(unified([
        { value: '{\nstring 1\n}', removed: true },
        { value: 'string 2', added: true },
      ])).to.deep.equals([
        { kind: '-', value: '{' },
        { kind: '-', changes: [
          { kind: ' ', value: 'string ' },
          { kind: '-', value: '1' },
        ] },
        { kind: '-', value: '}' },
        { kind: '+', changes: [
          { kind: ' ', value: 'string ' },
          { kind: '+', value: '2' },
        ] },
      ]);
    });

    it('changes in middle of lines', function() {
      expect(unified([
        { value: 'A long time ago\n', removed: true },
        { value: 'A not so long time ago\n', added: true },
        { value: 'in a galaxy far,\n' },
        { value: 'far away.... (actually not so far)', removed: true },
        { value: 'far away....', added: true },
      ])).to.deep.equals([
        { kind: '-', value: 'A long time ago' },
        { kind: '+', changes: [
          { kind: ' ', value: 'A ' },
          { kind: '+', value: 'not so ' },
          { kind: ' ', value: 'long time ago' },
        ] },
        { kind: ' ', value: 'in a galaxy far,' },
        { kind: '-', changes: [
          { kind: ' ', value: 'far away....' },
          { kind: '-', value: ' (actually not so far)' },
        ] },
        { kind: '+', value: 'far away....' },
      ]);
    });
  });
});
