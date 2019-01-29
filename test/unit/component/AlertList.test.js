import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import { Component as AlertList } from '../../../app/component/AlertList';
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
});
