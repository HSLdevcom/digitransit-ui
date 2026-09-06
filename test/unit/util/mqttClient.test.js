import { parseMessage } from '../../../app/util/mqttClient';

describe('mqttClient', () => {
  const testMessage = {
    VP: {
      lat: 123.123456,
      long: 123.123456,
    },
  };
  const testTopic =
    '/hfp/v2/journey/ongoing/vp/bus/0018/00296/1064/1/Itä-Pakila/16:12/1250101/5/60;24/29/04/85';

  describe('parseMessage', () => {
    it('should parse lat as a number rounded to 5 decimal places', () => {
      const topic =
        '/hfp/v2/journey/ongoing/vp/bus/0018/00296/1064/1/Itä-Pakila/16:12/1250101/5/60;24/29/04/85';
      const message = parseMessage(topic, testMessage, 'HSL');
      expect(message.lat).toBe(123.12346);
    });

    it('should parse long as a number rounded to 5 decimal places', () => {
      const topic =
        '/hfp/v2/journey/ongoing/vp/bus/0018/00296/1064/1/Itä-Pakila/16:12/1250101/5/60;24/29/04/85';
      const message = parseMessage(topic, testMessage, 'HSL');
      expect(message.long).toBe(123.12346);
    });

    it('should return undefined if long is null or undefined', () => {
      const rawMessage = {
        VP: {
          lat: 123.123456,
        },
      };
      const message = parseMessage(testTopic, rawMessage, 'HSL');
      expect(message).toBe(undefined);
    });

    it('should return undefined if lat is null or undefined', () => {
      const rawMessage = {
        VP: {
          long: 123.123456,
        },
      };
      const message = parseMessage(testTopic, rawMessage, 'HSL');
      expect(message).toBe(undefined);
    });

    it('maps hfp directions 1 and 2 to 0 and 1', () => {
      const message = parseMessage(testTopic, testMessage, 'HSL');
      expect(message.direction).toBe(0);
      const topic2 =
        '/hfp/v2/journey/ongoing/vp/bus/0018/00296/1064/2/Itä-Pakila/16:12/1250101/5/60;24/29/04/85';
      const message2 = parseMessage(topic2, testMessage, 'HSL');
      expect(message2.direction).toBe(1);
    });

    it('prefixes gtfs id with agency', () => {
      const message = parseMessage(testTopic, testMessage, 'HSL');
      expect(message.route).toContain('HSL:');
    });

    it('translates train -> rail', () => {
      const trainTopic =
        '/hfp/v2/journey/ongoing/vp/train/0018/00296/1064/1/Itä-Pakila/16:12/1250101/5/60;24/29/04/85';
      const message = parseMessage(trainTopic, testMessage, 'HSL');
      expect(message.mode).toBe('rail');
    });

    it('translates metro -> subway', () => {
      const metroTopic =
        '/hfp/v2/journey/ongoing/vp/metro/0018/00296/1064/1/Itä-Pakila/16:12/1250101/5/60;24/29/04/85';
      const message = parseMessage(metroTopic, testMessage, 'HSL');
      expect(message.mode).toBe('subway');
    });

    it('translates ubus -> bus', () => {
      const ubusTopic =
        '/hfp/v2/journey/ongoing/vp/ubus/0018/00296/1064/1/Itä-Pakila/16:12/1250101/5/60;24/29/04/85';
      const message = parseMessage(ubusTopic, testMessage, 'HSL');
      expect(message.mode).toBe('bus');
    });

    it('should return message when message.seq is 1', () => {
      const metroTopic =
        '/hfp/v2/journey/ongoing/vp/metro/0018/00296/1064/1/Itä-Pakila/16:12/1250101/5/60;24/29/04/85';
      const seqOneMessage = {
        VP: {
          lat: 123.123456,
          long: 123.123456,
          seq: 1,
        },
      };
      const message = parseMessage(metroTopic, seqOneMessage, 'HSL');
      expect(message).not.toBe(undefined);
    });

    it('should return undefined when message.seq is 2', () => {
      const metroTopic =
        '/hfp/v2/journey/ongoing/vp/metro/0018/00296/1064/1/Itä-Pakila/16:12/1250101/5/60;24/29/04/85';
      const seqOneMessage = {
        VP: {
          lat: 123.123456,
          long: 123.123456,
          seq: 2,
        },
      };
      const message = parseMessage(metroTopic, seqOneMessage, 'HSL');
      expect(message).toBe(undefined);
    });

    it('should remove : from tripStartTime', () => {
      const message = parseMessage(testTopic, testMessage, 'HSL');
      expect(message.tripStartTime).toBe('1612');
    });

    it('should convert times after midnight to 29 hour system', () => {
      const topic =
        '/hfp/v2/journey/ongoing/vp/metro/0018/00296/1064/1/Itä-Pakila/00:12/1250101/5/60;24/29/04/85';
      const message = parseMessage(topic, testMessage, 'HSL');
      expect(message.tripStartTime).toBe('2412');
    });
  });
});
