import { expect } from 'chai';
import { describe, it } from 'mocha';

import converter from 'base64-arraybuffer';
import bindings from '../../../app/util/gtfsrt';
import { parseFeedMQTT } from '../../../app/util/gtfsRtParser';

// Real arraybuffer data that was encoded into base64
const arrayBuffer = converter.decode(
  'Cg0KAzEuMBABGMa+6OQFEmgKBjEzMDIxMBAAIlwKKwoKNTY0NTkzNDY0NhIIMTQ6MzU6MDAaCDIwMTkwMzI2IAAqBTg2OTIxMAESFA1OCHZCFc1OvUEdKWNcQi1TCXM9KMW+6OQFMABCDwoGMTMwMjEwEgVBdGFsYQ==',
);

describe('gtfsRtParser', () => {
  describe('parseFeedMQTT', () => {
    it('GTFS RT vehicle position data for a route with a topic full of data should be parsed correctly', () => {
      const result = parseFeedMQTT(
        bindings.FeedMessage.read,
        arrayBuffer,
        '/gtfsrt/vp/tampere///TRAM/8/1/Atala/5645934646/123456/14:35/130210/61;23/47/62/47/8/',
        'tampere',
      );

      expect(result).to.deep.equal([
        {
          id: 'tampere:130210',
          route: 'tampere:8',
          direction: 1,
          tripStartTime: '1435',
          operatingDay: '20190326',
          mode: 'tram',
          next_stop: 'tampere:123456',
          timestamp: 1553604421,
          lat: 61.50812,
          long: 23.66348,
          heading: 55,
          headsign: 'Atala',
          tripId: 'tampere:5645934646',
          geoHash: ['61;23', '47', '62', '47'],
          shortName: '8',
        },
      ]);
    });

    it('GTFS RT vehicle position data for a topic with no directionId, startime, stopId, headsign or shortName', () => {
      const result = parseFeedMQTT(
        bindings.FeedMessage.read,
        arrayBuffer,
        '/gtfsrt/vp/tampere////15//////TKL_23/61;23/47/62/47/',
        'tampere',
      );

      expect(result).to.deep.equal([
        {
          id: 'tampere:TKL_23',
          route: 'tampere:15',
          direction: undefined,
          tripStartTime: undefined,
          operatingDay: '20190326',
          mode: 'bus',
          next_stop: undefined,
          timestamp: 1553604421,
          lat: 61.50812,
          long: 23.66348,
          heading: 55,
          headsign: undefined,
          tripId: undefined,
          geoHash: ['61;23', '47', '62', '47'],
          shortName: undefined,
        },
      ]);
    });
  });
});
