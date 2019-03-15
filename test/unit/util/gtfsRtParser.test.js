import { expect } from 'chai';
import { describe, it } from 'mocha';

import converter from 'base64-arraybuffer';
import bindings from '../../../app/util/gtfsrt';
import { parseFeedMQTT } from '../../../app/util/gtfsRtParser';

const route2 = {
  // Real arraybuffer data that was encoded into base64
  arrayBuffer: converter.decode(
    'Cg0KAzEuMBABGOm+ruQFEm8KBjEzMDA5MhAAImMKKwoKNTYyMzA4NDY0NxIIMTQ6Mzg6MDAaCDIwMTkwMzE1IAAqBTI2OTIxMAASFA02/3VCFec8vkEdy5KkQy37Jw8/KOi+ruQFMABCFgoGMTMwMDkyEgxQeXluaWtpbnRvcmk=',
  ),
  topic: '/gtfsrt/vp/tampere////2/0/Pyynikintori//14:38/130092',
  agency: 'tampere',
  mode: 'bus',
};

const route32 = {
  // Real arraybuffer data that was encoded into base64
  arrayBuffer: converter.decode(
    'Cg0KAzEuMBABGMy/ruQFEmwKBlRLTF82MxAAImAKLAoKNTY2OTkwNDY0NxIIMTQ6MjA6MDAaCDIwMTkwMzE1IAAqBjMyNjkyMTAAEhQNT811QhUbzL5BHQAAAAAtAAAAACjMv67kBTAAQhIKBlRLTF82MxIIVGFtcGVsbGE=',
  ),
  topic: '/gtfsrt/vp/tampere////32/0/Tampella//14:20/TKL_63',
  agency: 'tampere',
  mode: 'tram',
};

describe('gtfsRtParser', () => {
  describe('parseFeedMQTT', () => {
    it('GTFS RT vehicle position data for a bus route should be parsed correctly', () => {
      const result = parseFeedMQTT(
        bindings.FeedMessage.read,
        route2.arrayBuffer,
        route2.topic,
        route2.agency,
        route2.mode,
      );

      expect(result).to.deep.equal([
        {
          id: 'tampere:130092',
          route: 'tampere:2',
          direction: 0,
          tripStartTime: '1438',
          operatingDay: '20190315',
          mode: 'bus',
          next_stop: undefined,
          timestamp: 1552654184,
          lat: 61.49923,
          long: 23.77974,
          heading: 329,
        },
      ]);
    });

    it('GTFS RT vehicle position data for a tram route should be parsed correctly', () => {
      const result = parseFeedMQTT(
        bindings.FeedMessage.read,
        route32.arrayBuffer,
        route32.topic,
        route32.agency,
        route32.mode,
      );

      expect(result).to.deep.equal([
        {
          id: 'tampere:TKL_63',
          route: 'tampere:32',
          direction: 0,
          tripStartTime: '1420',
          operatingDay: '20190315',
          mode: 'tram',
          next_stop: undefined,
          timestamp: 1552654284,
          lat: 61.4505,
          long: 23.84967,
          heading: 0,
        },
      ]);
    });
  });
});
