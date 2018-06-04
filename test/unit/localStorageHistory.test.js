import { describe, it } from 'mocha';
import { getLocationListener } from '../../app/localStorageHistory';

describe('localStorageHistory', () => {
  describe('getLocationListener', () => {
    it('calling the listener method should not fail', () => {
      const listener = getLocationListener();
      const event = {
        action: 'POP',
      };

      listener(event);
    });
  });
});
