import { validateParams } from '../../../../server/middleware/legacyUrlMiddleware';

import config from '../../../../server/configs/config.default';
import { PREFIX_ITINERARY_SUMMARY } from '../../../../utils/shared/path';

/** A request for a raw URL, with only the fields validateParams reads. */
const request = url => ({ path: url.split('?')[0], originalUrl: url });

describe('legacyUrlMiddleware', () => {
  describe('validateParams', () => {
    const path = `/${PREFIX_ITINERARY_SUMMARY}`;
    const query =
      'minTransferTime=60&modes=BUS,TRAM,RAIL,SUBWAY,FERRY,WALK,CITYBIKE&transferPenalty=0&walkBoardCost=540&walkReluctance=1.5&walkSpeed=1.5';

    it('should not modify valid url', () => {
      expect(
        validateParams(request(`${path}?${query}`), config),
      ).toBeUndefined();
    });

    it('should remove invalid time parameter', () => {
      const url = validateParams(request(`${path}?${query}&time=test`), config);
      expect(url).toBe(`${path}?${query.replaceAll(',', '%2C')}`);
    });

    it('should remove a too old time parameter', () => {
      const url = validateParams(request('/x?time=1&a=b'), {
        queryMaxAgeDays: 14,
      });
      expect(url).toBe('/x?a=b');
    });

    it('should not leave a trailing "?" when removing the only query parameter', () => {
      expect(validateParams(request(`${path}?time=test`), config)).toBe(path);
    });

    it('should keep encoded values and repeated keys', () => {
      const url = validateParams(
        request('/x?time=x&a=%26b%3Dc&p=1&p=2&d=%C3%A4'),
        config,
      );
      expect(url).toBe('/x?a=%26b%3Dc&p=1&p=2&d=%C3%A4');
    });

    it('should keep a language prefix', () => {
      expect(validateParams(request('/en/x?time=test'), config)).toBe('/en/x');
    });
  });

  describe('protocol-relative paths', () => {
    it('never produces a redirect starting with "//"', () => {
      expect(validateParams(request('//example.com/x?time=abc'), config)).toBe(
        '/example.com/x',
      );
    });
  });
});
