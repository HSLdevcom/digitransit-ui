import { expect } from 'chai';
import { describe, it } from 'mocha';

import mapFares from '../../../app/util/fareUtils';

const defaultConfig = {
  showTicketInformation: true,
  fareMapping: fareId => fareId,
};

describe('fareUtils', () => {
  describe('mapFares', () => {
    it('should return null for missing fares', () => {
      expect(mapFares(null, defaultConfig, 'en')).to.equal(null);
    });

    it('should return null if showTicketInformation is falsey', () => {
      expect(mapFares([], {}, 'en')).to.equal(null);
    });

    it('should return null if no regular fares exist', () => {
      const fares = [
        {
          cents: 280,
          components: [
            {
              fareId: 'HSL:BC',
            },
          ],
          currency: 'EUR',
          type: 'foobar',
        },
      ];
      expect(mapFares(fares, defaultConfig, 'en')).to.equal(null);
    });

    it('should return null if the total cost is equal to -1', () => {
      const fares = [
        {
          cents: -1,
          components: [
            {
              fareId: 'HSL:BC',
            },
          ],
          currency: 'EUR',
          type: 'regular',
        },
      ];
      expect(mapFares(fares, defaultConfig, 'en')).to.equal(null);
    });

    it('should return null if there are no components', () => {
      const fares = [
        {
          cents: 280,
          components: null,
          currency: 'EUR',
          type: 'regular',
        },
      ];
      expect(mapFares(fares, defaultConfig, 'en')).to.equal(null);
    });

    it('should return an array containing a single fare', () => {
      const fares = [
        {
          cents: 280,
          components: [
            {
              fareId: 'HSL:BC',
            },
          ],
          currency: 'EUR',
          type: 'regular',
        },
      ];
      expect(mapFares(fares, defaultConfig, 'en')).to.deep.equal(['HSL:BC']);
    });

    it('should use the configured fareMapping function', () => {
      const fares = [
        {
          cents: 280,
          components: [
            {
              fareId: 'HSL:BC',
            },
          ],
          currency: 'EUR',
          type: 'regular',
        },
      ];
      const config = {
        ...defaultConfig,
        fareMapping: (fareId, lang) => `${fareId}_${lang}`,
      };
      expect(mapFares(fares, config, 'fi')).to.deep.equal(['HSL:BC_fi']);
    });
  });
});
