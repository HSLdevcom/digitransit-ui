import { getFaresFromLegs } from '../../../app/util/fareUtils';

const defaultConfig = {
  showTicketInformation: true,
  fareMapping: fareId => fareId,
  availableTickets: { HSL: { 'HSL:AB': { price: 3.1, zones: ['A', 'B'] } } },
};

describe('fareUtils', () => {
  describe('getFaresFromLegs', () => {
    it('should return null for missing fares', () => {
      expect(getFaresFromLegs(null, defaultConfig)).toBe(null);
      expect(getFaresFromLegs({}, defaultConfig)).toBe(null);
    });

    it('should return null if showTicketInformation is falsey', () => {
      expect(getFaresFromLegs([], {})).toBe(null);
    });

    it('should return empty list if no fare products are given', () => {
      const fares = [{ fareProducts: [] }];
      expect(getFaresFromLegs(fares, defaultConfig).length).toBe(0);
    });

    it('should return individual tickets even if the total cost is unknown', () => {
      const fares = [
        {
          fareProducts: [{ id: 1, product: { id: 'HSL:AB', price: '3.1' } }],
          route: { agency: {} },
        },
        { fareProducts: [], route: { agency: {} } },
      ];
      expect(getFaresFromLegs(fares, defaultConfig)).toHaveLength(2);
    });

    it('should return empty list if there are no fare products', () => {
      const fares = [{ fareProducts: [] }];
      expect(getFaresFromLegs(fares, defaultConfig).length).toBe(0);
    });

    it('should return an array containing a single fare', () => {
      const fares = [
        {
          fareProducts: [{ id: 1, product: { id: 'HSL:AB', price: '3.1' } }],
          route: { agency: {} },
        },
      ];
      const result = getFaresFromLegs(fares, defaultConfig);
      expect(result).toHaveLength(1);
    });

    it('should use the configured fareMapping function', () => {
      const fares = [
        {
          fareProducts: [
            {
              id: '1',
              product: { id: 'HSL:AB', price: { amount: 3.1 } },
            },
          ],
          route: { agency: { id: 'HSL:HSL' } },
        },
      ];
      const config = {
        ...defaultConfig,
        fareMapping: fareId => `${fareId.split(':')[1]}`,
      };
      expect(getFaresFromLegs(fares, config)[0].ticketName).toBe('AB');
    });

    it('should preserve the fare products properties', () => {
      const fares = [
        {
          fareProducts: [
            {
              id: '1',
              product: { id: 'HSL:AB', price: { amount: 3.1 } },
            },
          ],
          route: { agency: { id: 'HSL:HSL' } },
        },
      ];
      const config = {
        ...defaultConfig,
        fareMapping: fareId => fareId.replace('HSL:', ''),
      };
      expect(getFaresFromLegs(fares, config)[0].fareProducts).toEqual([
        {
          id: '1',
          product: { id: 'HSL:AB', price: { amount: 3.1 } },
        },
      ]);
    });

    it("should map the legs routes' agency", () => {
      const fares = [
        {
          fareProducts: [
            {
              id: '1',
              product: { id: 'HSL:AB', price: { amount: 3.1 } },
            },
          ],
          route: {
            agency: {
              name: 'foo',
              fareUrl: 'https://www.hsl.fi',
              gtfsId: 'bar',
            },
          },
        },
      ];
      const config = {
        ...defaultConfig,
        fareMapping: fareId => fareId.replace('HSL:', ''),
      };
      expect(getFaresFromLegs(fares, config)[0].agency).toEqual({
        name: 'foo',
        fareUrl: 'https://www.hsl.fi',
        gtfsId: 'bar',
      });
    });
  });

  it('should map route and agency props for unknown fares', () => {
    const fares = [
      {
        fareProducts: [
          {
            id: '1',
            product: { id: 'HSL:AB', price: { amount: 3.1 } },
          },
        ],
        route: {
          agency: {
            gtfsId: 'HSL:HSL',
          },
          gtfsId: 'HSL:1003',
        },
      },
      {
        fareProducts: [],
        route: {
          agency: {
            fareUrl: 'foobaz',
            gtfsId: 'FOO:BAR',
            name: 'Merisataman lauttaliikenne',
          },
          gtfsId: 'FOO:1234',
          longName: 'Merisataman lautta',
        },
      },
    ];

    const result = getFaresFromLegs(fares, defaultConfig);
    expect(result).toHaveLength(2);
    expect(result.filter(fare => fare.isUnknown)).toHaveLength(1);

    const unknown = result.find(fare => fare.isUnknown);
    expect(unknown.agency).toEqual({
      fareUrl: 'foobaz',
      gtfsId: 'FOO:BAR',
      name: 'Merisataman lauttaliikenne',
    });
    expect(unknown.routeGtfsId).toBe('FOO:1234');
    expect(unknown.routeName).toBe('Merisataman lautta');
  });

  it('should map route and agency props for unknown fares, even without known fares', () => {
    const fares = [
      {
        fareProducts: [],
        route: {
          gtfsId: 'HSL:1003',
          longName: 'Olympiaterminaali - Eira - Kallio - Meilahti',
          agency: {
            gtfsId: 'HSL:HSL',
          },
        },
      },
      {
        fareProducts: [],
        route: {
          gtfsId: 'FOO:1234',
          longName: 'Merisataman lautta',
          agency: {
            fareUrl: 'foobaz',
            gtfsId: 'FOO:BAR',
            name: 'Merisataman lauttaliikenne',
          },
        },
      },
    ];

    const result = getFaresFromLegs(fares, defaultConfig);
    expect(result).toHaveLength(2);
    expect(result.filter(fare => fare.isUnknown)).toHaveLength(2);

    const unknown = result.find(fare => fare.isUnknown);
    expect(unknown.agency).toEqual({
      fareUrl: undefined,
      gtfsId: 'HSL:HSL',
      name: undefined,
    });
    expect(unknown.routeGtfsId).toBe('HSL:1003');
    expect(unknown.routeName).toBe(
      'Olympiaterminaali - Eira - Kallio - Meilahti',
    );
  });

  it('should not suggest unknown tickets if the total fare is known', () => {
    const fares = [
      {
        fareProducts: [{ id: 1, product: { id: 'HSL:AB', price: '3.1' } }],
        route: {
          agency: {
            gtfsId: 'HSL:HSL',
          },
        },
      },
    ];
    const result = getFaresFromLegs(fares, defaultConfig);
    expect(result).toHaveLength(1);
    expect(result.filter(fare => fare.isUnknown)).toHaveLength(0);
  });
});
