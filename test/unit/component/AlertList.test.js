import { expect } from 'chai';
import { describe, it } from 'mocha';
import moment from 'moment';
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
    const wrapper = shallowWithIntl(<AlertList {...props} showExpired />);
    expect(wrapper.find(RouteAlertsRow).prop('expired')).to.equal(true);
  });

  it('should omit expired alerts', () => {
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
    expect(wrapper.find('.stop-no-alerts-container')).to.have.lengthOf(1);
  });

  it('should not show duplicate alerts for the same route', () => {
    const props = {
      currentTime: 1000,
      cancelations: [],
      serviceAlerts: [
        {
          description: 'foo',
          header: 'bar',
          route: {
            mode: 'BUS',
            shortName: '10',
          },
          validityPeriod: {
            startTime: 1000,
            endTime: 1100,
          },
        },
        {
          description: 'foo',
          header: 'bar',
          route: {
            mode: 'BUS',
            shortName: '10',
          },
          validityPeriod: {
            startTime: 1000,
            endTime: 1100,
          },
        },
      ],
    };
    const wrapper = shallowWithIntl(<AlertList {...props} />);
    expect(wrapper.find(RouteAlertsRow)).to.have.lengthOf(1);
  });

  it('should group duplicate alerts', () => {
    const props = {
      currentTime: 1000,
      cancelations: [],
      serviceAlerts: [
        {
          description: 'foo',
          header: 'bar',
          route: {
            mode: 'BUS',
            shortName: '10',
          },
          validityPeriod: {
            startTime: 1000,
            endTime: 1100,
          },
        },
        {
          description: 'foo',
          header: 'bar',
          route: {
            mode: 'BUS',
            shortName: '11',
          },
          validityPeriod: {
            startTime: 1000,
            endTime: 1100,
          },
        },
        {
          description: 'foo',
          header: 'bar',
          route: {
            mode: 'TRAM',
            shortName: '7',
          },
          validityPeriod: {
            startTime: 1000,
            endTime: 1100,
          },
        },
      ],
    };
    const wrapper = shallowWithIntl(<AlertList {...props} />);
    expect(wrapper.find(RouteAlertsRow)).to.have.lengthOf(2);
    expect(
      wrapper
        .find(RouteAlertsRow)
        .at(0)
        .props().routeLine,
    ).to.equal('7');
    expect(
      wrapper
        .find(RouteAlertsRow)
        .at(1)
        .props().routeLine,
    ).to.equal('10, 11');
  });
});
