import { describe, it, expect } from 'vitest';
import isKeyboardSelectionEvent from '../src/isKeyboardSelectionEvent.js';

const noop = () => {};

describe('browser', () => {
  describe('isKeyboardSelectionEvent', () => {
    it('should return true for space " "', () => {
      const event = {
        key: ' ',
        preventDefault: noop,
      };

      const result = isKeyboardSelectionEvent(event);
      expect(result).toBe(true);
    });

    it('should return true for space "Spacebar"', () => {
      const event = {
        key: 'Spacebar',
        preventDefault: noop,
      };

      const result = isKeyboardSelectionEvent(event);
      expect(result).toBe(true);
    });

    it('should return true for enter', () => {
      const event = {
        key: 'Enter',
        preventDefault: noop,
      };

      const result = isKeyboardSelectionEvent(event);
      expect(result).toBe(true);
    });

    it('should return false for invalid events', () => {
      expect(isKeyboardSelectionEvent(undefined)).toBe(false);
      expect(isKeyboardSelectionEvent(null)).toBe(false);
      expect(isKeyboardSelectionEvent(true)).toBe(false);
    });

    it('should call preventDefault for a matching event', () => {
      let wasCalled = false;
      const event = {
        key: 'Enter',
        preventDefault: () => {
          wasCalled = true;
        },
      };

      isKeyboardSelectionEvent(event);
      expect(wasCalled).toBe(true);
    });

    it('should not call preventDefault for a non-matching event', () => {
      let wasCalled = false;
      const event = {
        key: 'Tab',
        preventDefault: () => {
          wasCalled = true;
        },
      };

      isKeyboardSelectionEvent(event);
      expect(wasCalled).toBe(false);
    });

    it('should read .which if .key is not available', () => {
      const event = {
        preventDefault: noop,
        which: 32, // enter
      };

      const result = isKeyboardSelectionEvent(event);
      expect(result).toBe(true);
    });

    it('should read .keyCode if .which and .key are not available', () => {
      const event = {
        keyCode: 32, // enter
        preventDefault: () => {},
      };

      const result = isKeyboardSelectionEvent(event);
      expect(result).toBe(true);
    });
  });
});
