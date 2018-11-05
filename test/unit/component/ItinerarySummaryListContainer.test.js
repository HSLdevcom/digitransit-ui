import { expect } from 'chai';
import { describe, it } from 'mocha';

import { getZones } from '../../../app/component/ItinerarySummaryListContainer';

describe('<ItinerarySummaryListContainer />', () => {
  describe('getZones', () => {
    it('should return an empty array if there are no legs', () => {
      expect(getZones({})).to.deep.equal([]);
      expect(getZones(undefined)).to.deep.equal([]);
      expect(getZones(null)).to.deep.equal([]);
      expect(getZones([])).to.deep.equal([]);
    });

    it('should ignore a missing "from" field', () => {
      const legs = [
        {
          to: {
            stop: {
              zoneId: 'Foo',
            },
          },
        },
      ];
      expect(getZones(legs)).to.deep.equal(['Foo']);
    });

    it('should ignore a missing "to" field', () => {
      const legs = [
        {
          from: {
            stop: {
              zoneId: 'Foo',
            },
          },
        },
      ];
      expect(getZones(legs)).to.deep.equal(['Foo']);
    });

    it('should retrieve the zone from "from"', () => {
      const legs = [
        {
          from: {
            stop: {
              zoneId: 'Foo',
            },
          },
          to: {
            stop: {
              zoneId: null,
            },
          },
        },
      ];
      expect(getZones(legs)).to.deep.equal(['Foo']);
    });

    it('should retrieve the zone from "to"', () => {
      const legs = [
        {
          from: {
            stop: {
              zoneId: null,
            },
          },
          to: {
            stop: {
              zoneId: 'Foo',
            },
          },
        },
      ];
      expect(getZones(legs)).to.deep.equal(['Foo']);
    });

    it('should retrieve the zone from "intermediatePlaces"', () => {
      const legs = [
        {
          intermediatePlaces: [
            {
              stop: null,
            },
            {
              stop: {
                zoneId: null,
              },
            },
            {
              stop: {
                zoneId: 'Foo',
              },
            },
          ],
        },
      ];
      expect(getZones(legs)).to.deep.equal(['Foo']);
    });

    it('should add zone "B" if zones "A" and "C" already exist', () => {
      const legs = [
        {
          from: {
            stop: {
              zoneId: 'A',
            },
          },
        },
        {
          to: {
            stop: {
              zoneId: 'C',
            },
          },
        },
      ];
      expect(getZones(legs)).to.deep.equal(['A', 'B', 'C']);
    });

    it('should return unique values in alphabetical order', () => {
      const legs = [
        {
          from: null,
          intermediatePlaces: [
            {
              stop: {
                zoneId: 'Bar',
              },
            },
            {
              stop: {
                zoneId: 'Foo',
              },
            },
          ],
          to: {
            stop: {
              zoneId: 'Foo',
            },
          },
        },
        {
          from: {
            stop: {
              zoneId: 'Foo',
            },
          },
          to: {
            stop: {
              zoneId: 'Bar',
            },
          },
        },
        {
          from: {
            stop: {
              zoneId: 'Baz',
            },
          },
          to: {
            stop: {
              zoneId: 'Bar',
            },
          },
        },
      ];
      expect(getZones(legs)).to.deep.equal(['Bar', 'Baz', 'Foo']);
    });
  });
});
