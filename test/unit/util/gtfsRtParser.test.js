import { expect } from 'chai';
import { describe, it } from 'mocha';

import converter from 'base64-arraybuffer';
import bindings from '../../../app/util/gtfsrt';
import { parseFeedMQTT } from '../../../app/util/gtfsRtParser';

const route2 = {
  // Real arraybuffer data that was encoded into base64
  arrayBuffer: converter.decode(
    'Cg0KAzEuMBABGMa+6OQFEmgKBjEzMDIxMBAAIlwKKwoKNTY0NTkzNDY0NhIIMTQ6MzU6MDAaCDIwMTkwMzI2IAAqBTg2OTIxMAESFA1OCHZCFc1OvUEdKWNcQi1TCXM9KMW+6OQFMABCDwoGMTMwMjEwEgVBdGFsYQ==',
  ),
  topic: '/gtfsrt/vp/tampere////8/1/Atala/5645934646//14:35/130210',
  agency: 'tampere',
  mode: 'bus',
};

const route32 = {
  // Real arraybuffer data that was encoded into base64
  arrayBuffer: converter.decode(
    'Cg0KAzEuMBABGPa+6OQFEmsKBlRLTF8yMxAAIl8KLAoKNTY2MDM2NDY0NhIIMTQ6MzA6MDAaCDIwMTkwMzI2IAAqBjE1NjkyMTAAEhQN4Qd2QhVKU75BHQAAgEItAADgQCj0vujkBTAAQhEKBlRLTF8yMxIHUGV0c2Ftbw==',
  ),
  topic: '/gtfsrt/vp/tampere////15/0/Petsamo/5660364646//14:30/TKL_23',
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
          id: 'tampere:130210',
          route: 'tampere:8',
          direction: 1,
          tripStartTime: '1435',
          operatingDay: '20190326',
          mode: 'bus',
          next_stop: undefined,
          timestamp: 1553604421,
          lat: 61.50812,
          long: 23.66348,
          heading: 55,
          headsign: 'Atala',
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
          id: 'tampere:TKL_23',
          route: 'tampere:15',
          direction: 0,
          tripStartTime: '1430',
          operatingDay: '20190326',
          mode: 'tram',
          next_stop: undefined,
          timestamp: 1553604468,
          lat: 61.5077,
          long: 23.79067,
          heading: 64,
          headsign: 'Petsamo',
        },
      ]);
    });
  });
});
