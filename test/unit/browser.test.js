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
          {
            wasCalled = true;
          }
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
          {
            wasCalled = true;
          }
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
});
