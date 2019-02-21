import { expect } from 'chai';
import { describe, it } from 'mocha';
import moment from 'moment';
import React from 'react';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import {
  Component as AlertList,
  hasExpired,
} from '../../../app/component/AlertList';
import RouteAlertsRow from '../../../app/component/RouteAlertsRow';

describe('<AlertList />', () => {
  it('should show a "no alerts" message', () => {
    const props = {
      currentTime: 1547464412,
      cancelations: [],
      serviceAlerts: [],
    };
    const wrapper = shallowWithIntl(<AlertList {...props} />);
    expect(wrapper.find('.stop-no-alerts-container')).to.have.lengthOf(1);
  });

  it('should order the cancelations and service alerts by route shortName', () => {
    const props = {
      currentTime: 1547464412,
      cancelations: [
        {
          header: 'second',
          route: {
            mode: 'BUS',
            shortName: '37N',
          },
          validityPeriod: {
            startTime: 1547464413,
          },
        },
        {
          header: 'fourth',
          route: {
            mode: 'RAIL',
            shortName: 'A',
          },
          validityPeriod: {
            startTime: 1547464413,
          },
        },
      ],
      serviceAlerts: [
        {
          header: 'third',
          route: {
            mode: 'BUS',
            shortName: '138',
          },
          validityPeriod: {
            startTime: 1547464413,
          },
        },
        {
          header: 'first',
          route: {
            mode: 'TRAM',
            shortName: '8A',
          },
          validityPeriod: {
            startTime: 1547464413,
          },
        },
      ],
    };
    const wrapper = shallowWithIntl(<AlertList {...props} />);
    expect(
      wrapper
        .find(RouteAlertsRow)
        .at(0)
        .prop('header'),
    ).to.equal('first');
    expect(
      wrapper
        .find(RouteAlertsRow)
        .at(1)
        .prop('header'),
    ).to.equal('second');
    expect(
      wrapper
        .find(RouteAlertsRow)
        .at(2)
        .prop('header'),
    ).to.equal('third');
    expect(
      wrapper
        .find(RouteAlertsRow)
        .at(3)
        .prop('header'),
    ).to.equal('fourth');
  });

  it('should indicate that an alert has not expired', () => {
    const props = {
      currentTime: moment.unix(1547464412),
      cancelations: [
        {
          header: 'foo',
          route: {
            mode: 'BUS',
            shortName: '63',
          },
          validityPeriod: {
            startTime: 1547464413,
            endTime: 1547464415,
          },
        },
      ],
    };
    const wrapper = shallowWithIntl(<AlertList {...props} />);
    expect(wrapper.find(RouteAlertsRow).prop('expired')).to.equal(false);
  });

  it('should indicate that an alert has expired', () => {
    const props = {
      currentTime: moment.unix(1547465412),
      cancelations: [
        {
          header: 'foo',
          route: {
            mode: 'BUS',
            shortName: '63',
          },
          validityPeriod: {
            startTime: 1547464412,
            endTime: 1547464415,
          },
        },
      ],
    };
    const wrapper = shallowWithIntl(<AlertList {...props} />);
    expect(wrapper.find(RouteAlertsRow).prop('expired')).to.equal(true);
  });

  describe('hasExpired', () => {
    it('should mark an alert in the past as expired', () => {
      expect(hasExpired({ startTime: 1000, endTime: 2000 }, 2500)).to.equal(
        true,
      );
    });

    it('should not mark a current alert as expired', () => {
      expect(hasExpired({ startTime: 1000, endTime: 2000 }, 1500)).to.equal(
        false,
      );
    });

    it('should not mark a current alert within DEFAULT_VALIDITY period as expired', () => {
      expect(hasExpired({ startTime: 1000 }, 1100, 200)).to.equal(false);
    });

    it('should mark an alert after the DEFAULT_VALIDITY period as expired', () => {
      expect(hasExpired({ startTime: 1000 }, 1300, 200)).to.equal(true);
    });

    it('should not mark an alert in the future as expired', () => {
      expect(hasExpired({ startTime: 1000, endTime: 2000 }, 500)).to.equal(
        false,
      );
    });
  });
});
