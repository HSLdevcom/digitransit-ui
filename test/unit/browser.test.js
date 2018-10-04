import { expect } from 'chai';
import { describe, it } from 'mocha';

import * as utils from '../../app/util/browser';

const noop = () => {};

describe('browser', () => {
  describe('isKeyboardSelectionEvent', () => {
    it('should return true for space " "', () => {
      const event = {
        key: ' ',
        preventDefault: noop,
      };

      const result = utils.isKeyboardSelectionEvent(event);
      expect(result).to.equal(true);
    });

    it('should return true for space "Spacebar"', () => {
      const event = {
        key: 'Spacebar',
        preventDefault: noop,
      };

      const result = utils.isKeyboardSelectionEvent(event);
      expect(result).to.equal(true);
    });

    it('should return true for enter', () => {
      const event = {
        key: 'Enter',
        preventDefault: noop,
      };

      const result = utils.isKeyboardSelectionEvent(event);
      expect(result).to.equal(true);
    });

    it('should return false for invalid events', () => {
      expect(utils.isKeyboardSelectionEvent(undefined)).to.equal(false);
      expect(utils.isKeyboardSelectionEvent(null)).to.equal(false);
      expect(utils.isKeyboardSelectionEvent(true)).to.equal(false);
    });

    it('should call preventDefault for a matching event', () => {
      let wasCalled = false;
      const event = {
        key: 'Enter',
        preventDefault: () => {
          wasCalled = true;
        },
      };

      utils.isKeyboardSelectionEvent(event);
      expect(wasCalled).to.equal(true);
    });

    it('should not call preventDefault for a non-matching event', () => {
      let wasCalled = false;
      const event = {
        key: 'Tab',
        preventDefault: () => {
          wasCalled = true;
        },
      };

      utils.isKeyboardSelectionEvent(event);
      expect(wasCalled).to.equal(false);
    });

    it('should read .which if .key is not available', () => {
      const event = {
        preventDefault: noop,
        which: 32, // enter
      };

      const result = utils.isKeyboardSelectionEvent(event);
      expect(result).to.equal(true);
    });

    it('should read .keyCode if .which and .key are not available', () => {
      const event = {
        keyCode: 32, // enter
        preventDefault: () => {},
      };

      const result = utils.isKeyboardSelectionEvent(event);
      expect(result).to.equal(true);
    });
  });

  describe('getDrawerWidth', () => {
    it('should return a numeric minimum width if window is not defined', () => {
      const result = utils.getDrawerWidth(undefined);
      expect(result).to.be.greaterThan(0);
    });

    it('should return the given minimum width if window is not defined', () => {
      const result = utils.getDrawerWidth(undefined, { minWidth: 100 });
      expect(result).to.equal(100);
    });

    it('should return half of the window innerWidth', () => {
      const window = {
        innerWidth: 768,
      };
      const result = utils.getDrawerWidth(window);
      expect(result).to.equal(384);
    });

    it('should return at most maxWidth', () => {
      const window = {
        innerWidth: 1440,
      };
      const result = utils.getDrawerWidth(window, { maxWidth: 600 });
      expect(result).to.equal(600);
    });

    it('should return 100% if half of the window width is not larger than minWidth', () => {
      const window = {
        innerWidth: 320,
      };
      const result = utils.getDrawerWidth(window, { minWidth: 160 });
      expect(result).to.equal('100%');
    });
  });
});
