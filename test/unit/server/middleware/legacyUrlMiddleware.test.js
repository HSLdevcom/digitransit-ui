import { validateParams } from '../../../../server/middleware/legacyUrlMiddleware';

import config from '../../../../server/configs/config.default';
import { PREFIX_ITINERARY_SUMMARY } from '../../../../utils/shared/path';

describe('legacyUrlMiddleware', () => {
  describe('validateParams', () => {
    const req = {
      path: `/${PREFIX_ITINERARY_SUMMARY}`,
      query: {
        minTransferTime: '60',
        modes: 'BUS,TRAM,RAIL,SUBWAY,FERRY,WALK,CITYBIKE',
        transferPenalty: '0',
        walkBoardCost: '540',
        walkReluctance: '1.5',
        walkSpeed: '1.5',
      },
    };

    it('should not modify valid url', () => {
      const url = validateParams(req, config);
      expect(url).toBeUndefined();
    });

    it('should remove invalid time parameter', () => {
      req.query.time = 'test';
      const url = validateParams(req, config);
      expect(url).toBe(
        `/${PREFIX_ITINERARY_SUMMARY}?minTransferTime=60&modes=BUS,TRAM,RAIL,SUBWAY,FERRY,WALK,CITYBIKE&transferPenalty=0&walkBoardCost=540&walkReluctance=1.5&walkSpeed=1.5`,
      );
    });

    it('should remove a too old time parameter', () => {
      const oldReq = { path: '/x', query: { time: '1', a: 'b' } };
      const url = validateParams(oldReq, { queryMaxAgeDays: 14 });
      expect(url).toBe('/x?a=b');
    });

    it('should not leave a trailing "?" when removing the only query parameter', () => {
      const emptyReq = {
        path: `/${PREFIX_ITINERARY_SUMMARY}`,
        query: { time: 'test' },
      };
      const url = validateParams(emptyReq, config);
      expect(url).toBe(`/${PREFIX_ITINERARY_SUMMARY}`);
    });
  });

  describe('protocol-relative paths', () => {
    it('never produces a redirect starting with "//"', () => {
      const bad = { path: '//example.com/x', query: { time: 'abc' } };
      expect(validateParams(bad, config)).toBe('/example.com/x');
    });
  });
});
