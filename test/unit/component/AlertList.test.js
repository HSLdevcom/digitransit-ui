import React from 'react';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import { Component as AlertList } from '../../../app/component/AlertList';
import RouteAlertsRow from '../../../app/component/RouteAlertsRow';
import { AlertSeverityLevelType } from '../../../app/constants';

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
      currentTime: 1547464414,
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

  it('should indicate that a cancelation has expired', () => {
    const props = {
      currentTime: 100,
      cancelations: [
        {
          header: 'foo',
          route: {
            mode: 'BUS',
            shortName: '63',
          },
          validityPeriod: {
            startTime: 1,
            endTime: 99,
          },
        },
      ],
    };
    const wrapper = shallowWithIntl(<AlertList {...props} showExpired />);
    expect(wrapper.find(RouteAlertsRow).prop('expired')).to.equal(true);
  });

  it('should indicate that a service alert has expired', () => {
    const props = {
      currentTime: 100,
      serviceAlerts: [
        {
          header: 'foo',
          route: {
            mode: 'BUS',
            shortName: '63',
          },
          validityPeriod: {
            startTime: 1,
            endTime: 99,
          },
        },
      ],
    };
    const wrapper = shallowWithIntl(<AlertList {...props} showExpired />);
    expect(wrapper.find(RouteAlertsRow).prop('expired')).to.equal(true);
  });

  it('should not display past cancelations or service alerts', () => {
    const props = {
      currentTime: 100,
      cancelations: [
        {
          validityPeriod: {
            startTime: 1,
            endTime: 99,
          },
        },
      ],
      serviceAlerts: [
        {
          validityPeriod: {
            startTime: 1,
            endTime: 99,
          },
        },
      ],
    };
    const wrapper = shallowWithIntl(<AlertList {...props} />);
    expect(wrapper.find('.stop-no-alerts-container')).to.have.lengthOf(1);
  });

  it('should display current cancelations and service alerts', () => {
    const props = {
      currentTime: 100,
      cancelations: [
        {
          header: 'cancelation',
          validityPeriod: {
            startTime: 100,
            endTime: 100,
          },
        },
      ],
      serviceAlerts: [
        {
          header: 'servicealert',
          validityPeriod: {
            startTime: 100,
            endTime: 100,
          },
        },
      ],
    };
    const wrapper = shallowWithIntl(<AlertList {...props} />);
    expect(wrapper.find(RouteAlertsRow)).to.have.lengthOf(2);
  });

  it('should display future cancelations', () => {
    const props = {
      currentTime: 100,
      cancelations: [
        {
          validityPeriod: {
            startTime: 101,
            endTime: 200,
          },
        },
      ],
    };
    const wrapper = shallowWithIntl(<AlertList {...props} />);
    expect(wrapper.find(RouteAlertsRow)).to.have.lengthOf(1);
  });

  it('should not display future service alerts', () => {
    const props = {
      currentTime: 100,
      serviceAlerts: [
        {
          validityPeriod: {
            startTime: 101,
            endTime: 200,
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

  it('should mark cancelations with severity level "WARNING"', () => {
    const props = {
      currentTime: 1000,
      cancelations: [
        {
          validityPeriod: {
            startTime: 900,
            endTime: 1100,
          },
        },
      ],
    };
    const wrapper = shallowWithIntl(<AlertList {...props} />);
    expect(wrapper.find(RouteAlertsRow).prop('severityLevel')).to.equal(
      AlertSeverityLevelType.Warning,
    );
  });
});
