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
      expect(mapFares({}, defaultConfig, 'en')).to.equal(null);
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

    it('should return individual tickets even if the total cost is equal to -1', () => {
      const fares = [
        {
          cents: -1,
          components: [
            {
              cents: 280,
              fareId: 'HSL:BC',
            },
          ],
          currency: 'EUR',
          type: 'regular',
        },
      ];
      expect(mapFares(fares, defaultConfig, 'en')).to.have.lengthOf(1);
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
      const result = mapFares(fares, defaultConfig, 'en');
      expect(result).to.have.lengthOf(1);
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
      expect(mapFares(fares, config, 'fi')[0].ticketName).to.equal('HSL:BC_fi');
    });

    it("should preserve the fareComponent's properties", () => {
      const fares = [
        {
          cents: 280,
          currency: 'EUR',
          components: [
            {
              cents: 280,
              routes: [{ gtfsId: 'HSL:1003' }],
              fareId: 'HSL:AB',
            },
          ],
          type: 'regular',
        },
      ];
      const config = {
        ...defaultConfig,
        fareMapping: fareId => fareId.replace('HSL:', ''),
      };
      expect(mapFares(fares, config, 'fi')).to.deep.equal([
        {
          agency: undefined,
          cents: 280,
          fareId: 'HSL:AB',
          routes: [{ gtfsId: 'HSL:1003' }],
          ticketName: 'AB',
        },
      ]);
    });

    it("should map the fareComponent's routes' agency", () => {
      const fares = [
        {
          cents: 280,
          currency: 'EUR',
          components: [
            {
              cents: 280,
              routes: [
                {
                  agency: {
                    name: 'foo',
                    fareUrl: 'https://www.hsl.fi',
                    gtfsId: 'bar',
                  },
                  gtfsId: 'HSL:1003',
                },
              ],
              fareId: 'HSL:AB',
            },
          ],
          type: 'regular',
        },
      ];
      const config = {
        ...defaultConfig,
        fareMapping: fareId => fareId.replace('HSL:', ''),
      };
      expect(mapFares(fares, config, 'fi')[0].agency).to.deep.equal({
        name: 'foo',
        fareUrl: 'https://www.hsl.fi',
        gtfsId: 'bar',
      });
    });
  });
});
