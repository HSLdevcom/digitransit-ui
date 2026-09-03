import { expect } from 'chai';
import { describe, it } from 'mocha';

import { getStopBadge } from '../../../app/util/stopStatusSearchUtils';
import { STOP_STATUS_BADGE_IMGS } from '../../../app/util/stopStatusUtils';

describe('stopStatusSearchUtils', () => {
  describe('getStopBadge', () => {
    it('returns null for layers that are not stops or stations', () => {
      const item = {
        properties: {
          layer: 'address',
          gtfsId: 'HSL:1234567',
          addendum: { GTFS: { noService: true } },
        },
      };
      expect(getStopBadge(item)).to.equal(null);
    });

    it('returns null when item.properties is missing entirely', () => {
      expect(getStopBadge({})).to.equal(null);
    });

    ['stop', 'favouriteStop', 'station', 'favouriteStation'].forEach(layer => {
      it(`considers the "${layer}" layer eligible for a badge`, () => {
        const item = {
          properties: {
            layer,
            gtfsId: 'HSL:1234567',
            addendum: { GTFS: { noService: true } },
          },
        };
        expect(getStopBadge(item)).to.equal(
          STOP_STATUS_BADGE_IMGS['out-of-service'],
        );
      });
    });

    it('returns null when no gtfsId can be resolved', () => {
      const item = {
        properties: {
          layer: 'stop',
          gid: 'whosonfirst:venue:1234',
          addendum: { GTFS: { noService: true } },
        },
      };
      expect(getStopBadge(item)).to.equal(null);
    });

    it('extracts the gtfsId from item.properties.gid', () => {
      const item = {
        properties: {
          layer: 'stop',
          gid: 'GTFS:HSL:1234567#0',
          addendum: { GTFS: { noService: true } },
        },
      };
      expect(getStopBadge(item)).to.equal(
        STOP_STATUS_BADGE_IMGS['out-of-service'],
      );
    });

    it('extracts the gtfsId from a top-level item.gtfsId as a fallback', () => {
      const item = {
        gtfsId: 'HSL:1234567',
        properties: {
          layer: 'stop',
          addendum: { GTFS: { noService: true } },
        },
      };
      expect(getStopBadge(item)).to.equal(
        STOP_STATUS_BADGE_IMGS['out-of-service'],
      );
    });

    it('prefers item.properties.gtfsId over the top-level item.gtfsId', () => {
      const item = {
        gtfsId: 'HSL:7654321',
        properties: {
          layer: 'stop',
          gtfsId: 'HSL:1234567',
          addendum: { GTFS: { noService: true } },
        },
      };
      expect(getStopBadge(item)).to.equal(
        STOP_STATUS_BADGE_IMGS['out-of-service'],
      );
    });

    it('extracts the gtfsId from a gid with no trailing "#" segment', () => {
      const item = {
        properties: {
          layer: 'stop',
          gid: 'GTFS:HSL:1234567',
          addendum: { GTFS: { noService: true } },
        },
      };
      expect(getStopBadge(item)).to.equal(
        STOP_STATUS_BADGE_IMGS['out-of-service'],
      );
    });

    it('returns null when there is no GTFS addendum data', () => {
      const item = {
        properties: {
          layer: 'stop',
          gtfsId: 'HSL:1234567',
        },
      };
      expect(getStopBadge(item)).to.equal(null);
    });

    it('prioritises noService over noServiceToday and alertSeverity', () => {
      const item = {
        properties: {
          layer: 'stop',
          gtfsId: 'HSL:1234567',
          addendum: {
            GTFS: {
              noService: true,
              noServiceToday: true,
              alertSeverity: 'alert',
            },
          },
        },
      };
      expect(getStopBadge(item)).to.equal(
        STOP_STATUS_BADGE_IMGS['out-of-service'],
      );
    });

    it('prioritises noServiceToday over alertSeverity', () => {
      const item = {
        properties: {
          layer: 'stop',
          gtfsId: 'HSL:1234567',
          addendum: {
            GTFS: {
              noServiceToday: true,
              alertSeverity: 'alert',
            },
          },
        },
      };
      expect(getStopBadge(item)).to.equal(
        STOP_STATUS_BADGE_IMGS['no-service-today'],
      );
    });

    it('returns the alert badge for an "alert" severity', () => {
      const item = {
        properties: {
          layer: 'station',
          gtfsId: 'HSL:1234567',
          addendum: { GTFS: { alertSeverity: 'alert' } },
        },
      };
      expect(getStopBadge(item)).to.equal(STOP_STATUS_BADGE_IMGS.alert);
    });

    it('returns the info badge for an "info" severity', () => {
      const item = {
        properties: {
          layer: 'station',
          gtfsId: 'HSL:1234567',
          addendum: { GTFS: { alertSeverity: 'info' } },
        },
      };
      expect(getStopBadge(item)).to.equal(STOP_STATUS_BADGE_IMGS.info);
    });

    it('returns null for an unrecognized alert severity', () => {
      const item = {
        properties: {
          layer: 'station',
          gtfsId: 'HSL:1234567',
          addendum: { GTFS: { alertSeverity: 'unknown' } },
        },
      };
      expect(getStopBadge(item)).to.equal(null);
    });
  });
});
