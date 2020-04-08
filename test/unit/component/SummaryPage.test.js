import sinon from 'sinon';

import {
  getActiveIndex,
  reportError,
} from '../../../app/component/SummaryPage';
import { RealtimeStateType } from '../../../app/constants';
import { PREFIX_ITINERARY_SUMMARY } from '../../../app/util/path';
import * as analytics from '../../../app/util/analyticsUtils';

describe('<SummaryPage />', () => {
  describe('getActiveIndex', () => {
    it('should return the value from location state', () => {
      const location = { state: { summaryPageSelected: 1 } };
      expect(getActiveIndex(location)).to.equal(1);
    });

    it('should return the default value if location state exists but has no value', () => {
      const location = { state: {} };
      expect(getActiveIndex(location, undefined, 2)).to.equal(2);
    });

    it('should retrieve the value from location pathname', () => {
      const location = { pathname: `/${PREFIX_ITINERARY_SUMMARY}/from/to/5` };
      expect(getActiveIndex(location)).to.equal(5);
    });

    it('should use the first non-canceled itinerary', () => {
      const itineraries = [
        {
          legs: [
            {
              realtimeState: RealtimeStateType.Canceled,
            },
          ],
        },
        {
          legs: [
            {
              realtimeState: RealtimeStateType.Scheduled,
            },
          ],
        },
        {
          legs: [
            {
              realtimeState: RealtimeStateType.Scheduled,
            },
          ],
        },
      ];
      expect(getActiveIndex({}, itineraries)).to.equal(1);
    });

    it('should return the default value if all the itineraries are canceled', () => {
      const itineraries = [
        {
          legs: [
            {
              realtimeState: RealtimeStateType.Canceled,
            },
          ],
        },
        {
          legs: [
            {
              realtimeState: RealtimeStateType.Canceled,
            },
          ],
        },
      ];
      expect(getActiveIndex({}, itineraries, 3)).to.equal(3);
    });

    it('should return the default value if location and itineraries do not exist', () => {
      expect(getActiveIndex({}, [], 3)).to.equal(3);
    });
  });
  describe('reportError', () => {
    it('should call addAnalyticsEvent', () => {
      const spy = sinon.spy(analytics, 'addAnalyticsEvent');
      reportError('ERROR');
      expect(spy.calledOnce).to.equal(true);
      spy.restore();
    });
  });
});
