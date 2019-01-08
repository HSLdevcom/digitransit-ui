import { expect } from 'chai';
import { describe, it } from 'mocha';

import * as data from '../test-data/gtfsrt-feed';
import bindings from '../../../app/util/gtfsrt';
import GtfsRtParser, { parseFeed } from '../../../app/util/gtfsRtParser';

const defaultAgency = 'HSL';
const defaultRoutes = [
  {
    gtfsId: '32',
    mode: 'bus',
    route: '32',
  },
];

describe('gtfsRtParser', () => {
  describe('parse', () => {
    it('should parse the given arraybuffer', () => {
      const parser = new GtfsRtParser(defaultAgency, bindings);
      const result = parser.parse(data.arrayBuffer, defaultRoutes);
      expect(result).to.not.equal(null);
    });
  });

  describe('parseFeed', () => {
    it('should return null if no routes are tracked', () => {
      const routes = [];
      const result = parseFeed(data.json, defaultAgency, routes);
      expect(result).to.equal(null);
    });

    it('should return null if no matching route is found', () => {
      const routes = [
        {
          gtfsId: '114',
          mode: 'bus',
          route: '114',
        },
      ];
      const result = parseFeed(data.json, defaultAgency, routes);
      expect(result).to.equal(null);
    });

    it('should find the given route', () => {
      const result = parseFeed(data.json, defaultAgency, defaultRoutes);
      expect(result).to.have.lengthOf(5);
    });

    it('should find all the given routes', () => {
      const routes = [
        ...defaultRoutes,
        {
          gtfsId: '5',
          mode: 'bus',
          route: '5',
        },
      ];
      const result = parseFeed(data.json, defaultAgency, routes);
      expect(result).to.have.lengthOf(6);
    });

    it('should return a valid message', () => {
      const routes = [
        {
          gtfsId: '5',
          mode: 'bus',
          route: '5',
        },
      ];
      const result = parseFeed(data.json, defaultAgency, routes)[0];
      expect(result).to.deep.equal({
        id: 'HSL:TKL_19',
        route: 'HSL:5',
        direction: 0,
        tripStartTime: '131500',
        operatingDay: '20181213',
        mode: 'bus',
        next_stop: '',
        timestamp: 1544698447,
        lat: 61.45803,
        long: 23.84659,
        heading: 0,
      });
    });
  });
});
