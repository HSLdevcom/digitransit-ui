import { decode } from 'base64-arraybuffer';
import Pbf from 'pbf';
import bindings from '../../../../utils/client/gtfsrt';
import { parseFeedMQTT } from '../../../../utils/client/gtfsRtParser';

// Real arraybuffer data that was encoded into base64
const arrayBuffer = decode(
  'Cg0KAzEuMBABGMa+6OQFEmgKBjEzMDIxMBAAIlwKKwoKNTY0NTkzNDY0NhIIMTQ6MzU6MDAaCDIwMTkwMzI2IAAqBTg2OTIxMAESFA1OCHZCFc1OvUEdKWNcQi1TCXM9KMW+6OQFMABCDwoGMTMwMjEwEgVBdGFsYQ==',
);

describe('gtfsRtParser', () => {
  describe('parseFeedMQTT', () => {
    it('keeps slash-separated vehicle IDs distinct and preserves the topic suffix', () => {
      const messages = ['50/325', '50/323'].flatMap(vehicleId => {
        const writer = new Pbf();
        bindings.FeedMessage.write(
          {
            header: { gtfs_realtime_version: '1.0', timestamp: 1792399779 },
            entity: [
              {
                id: vehicleId,
                vehicle: {
                  trip: {
                    route_id: '20256',
                    start_time: '11:45:00',
                    start_date: '20261019',
                  },
                  vehicle: { id: vehicleId },
                  position: { latitude: 60.17455, longitude: 24.82836 },
                },
              },
            ],
          },
          writer,
        );
        return parseFeedMQTT(
          bindings.FeedMessage.read,
          writer.finish(),
          `/gtfsrt/vp/MATKA///SUBWAY/20256/0///FSR:Quay:10537/11:45/${vehicleId}/60;24/18/72/48/M2//`,
        );
      });

      expect(messages.map(message => message.id)).toEqual([
        'MATKA:50/325',
        'MATKA:50/323',
      ]);
      messages.forEach(message => {
        expect(message).toMatchObject({
          route: 'MATKA:20256',
          direction: 0,
          tripStartTime: '1145',
          geoHash: ['60;24', '18', '72', '48'],
          shortName: 'M2',
          color: undefined,
        });
      });
    });

    it('GTFS RT vehicle position data for a route with a topic full of data should be parsed correctly', () => {
      const result = parseFeedMQTT(
        bindings.FeedMessage.read,
        arrayBuffer,
        '/gtfsrt/vp/tampere///TRAM/8/1/Atala/5645934646/123456/14:35/130210/61;23/47/62/47/8/000000/',
      );

      expect(result).toEqual([
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
          color: '000000',
        },
      ]);
    });

    it('GTFS RT vehicle position data for a topic with no directionId, startime, stopId, headsign or shortName', () => {
      const result = parseFeedMQTT(
        bindings.FeedMessage.read,
        arrayBuffer,
        '/gtfsrt/vp/tampere////15//////TKL_23/61;23/47/62/47//',
      );

      expect(result).toEqual([
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
          color: undefined,
        },
      ]);
    });
  });
});
