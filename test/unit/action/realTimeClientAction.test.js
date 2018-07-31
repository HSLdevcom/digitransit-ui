import { expect } from 'chai';
import { describe, it } from 'mocha';
import { parseMessage } from '../../../app/action/realTimeClientAction';

describe('realTimeClientAction', () => {
  describe('parseMessage', () => {
    it('should parse lat as a number rounded to 5 decimal places', () => {
      const topic =
        '/hfp/v1/journey/ongoing/bus/0018/00296/1064/1/Itä-Pakila/16:12/1250101/5/60;24/29/04/85';
      const rawMessage = {
        VP: {
          lat: 123.123456,
        },
      };

      let wasCalled = false;
      parseMessage(topic, rawMessage, {
        dispatch: (omitted, { message }) => {
          wasCalled = true;
          expect(message.lat).to.equal(123.12346);
        },
      });
      expect(wasCalled).to.equal(true);
    });

    it('should parse long as a number rounded to 5 decimal places', () => {
      const topic =
        '/hfp/v1/journey/ongoing/bus/0018/00296/1064/1/Itä-Pakila/16:12/1250101/5/60;24/29/04/85';
      const rawMessage = {
        VP: {
          long: 123.123456,
        },
      };

      let wasCalled = false;
      parseMessage(topic, rawMessage, {
        dispatch: (omitted, { message }) => {
          wasCalled = true;
          expect(message.long).to.equal(123.12346);
        },
      });
      expect(wasCalled).to.equal(true);
    });
  });
});
