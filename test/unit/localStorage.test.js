import { describe, it } from 'mocha';
import { resetCustomizedSettings } from '../../app/store/localStorage';

describe('localStorage', () => {
  describe('resetCustomizedSettings()', () => {
    it('calling this function should not fail', () => {
      resetCustomizedSettings();
    });
  });
});
