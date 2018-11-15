import { expect } from 'chai';
import { describe, it } from 'mocha';
import { parseMessage } from '../../../app/util/mqttClient';

describe('mqttClient', () => {
  const emptyMessage = {VP: {} };
  const testTopic =
    '/hfp/v1/journey/ongoing/bus/0018/00296/1064/1/Itä-Pakila/16:12/1250101/5/60;24/29/04/85';

  describe('parseMessage', () => {
    it('should parse lat as a number rounded to 5 decimal places', () => {
      const topic =
        '/hfp/v1/journey/ongoing/bus/0018/00296/1064/1/Itä-Pakila/16:12/1250101/5/60;24/29/04/85';
      const rawMessage = {
        VP: {
          lat: 123.123456,
        },
      };

      const message = parseMessage(topic, rawMessage, 'HSL');
      expect(message.lat).to.equal(123.12346);
    });

    it('should parse long as a number rounded to 5 decimal places', () => {
      const topic =
        '/hfp/v1/journey/ongoing/bus/0018/00296/1064/1/Itä-Pakila/16:12/1250101/5/60;24/29/04/85';
      const rawMessage = {
        VP: {
          long: 123.123456,
        },
      };
      const message = parseMessage(topic, rawMessage, 'HSL');
      expect(message.long).to.equal(123.12346);
    });

    it('maps hfp directions 1 and 2 to 0 and 1', () => {
      const message = parseMessage(testTopic, emptyMessage, 'HSL');
      expect(message.direction).to.equal(0);
      const topic2 =
        '/hfp/v1/journey/ongoing/bus/0018/00296/1064/2/Itä-Pakila/16:12/1250101/5/60;24/29/04/85';
      const message2 = parseMessage(topic2, emptyMessage, 'HSL');
      expect(message2.direction).to.equal(1);
    });

    it('prefixes gtfs id with agency', () => {
      const message = parseMessage(testTopic, emptyMessage, 'HSL');
      expect(message.route).to.include('HSL:');
    });
  });
});
