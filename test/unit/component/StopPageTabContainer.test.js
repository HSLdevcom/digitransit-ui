import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import { AlertSeverityLevelType } from '../../../app/constants';
import { Component as StopPageTabContainer } from '../../../app/component/StopPageTabContainer';

describe('<StopPageTabContainer />', () => {
  it('should render the disruptions tab for stops', () => {
    const props = {
      breakpoint: 'large',
      children: <div />,
      location: {
        pathname: 'foobar',
      },
      params: {
        stopId: 'HSL:2211275',
      },
      routes: [],
      stop: {},
    };
    const wrapper = shallowWithIntl(<StopPageTabContainer {...props} />);
    expect(wrapper.find('.stop-tab-singletab')).to.have.lengthOf(4);
    expect(
      wrapper
        .find('.stop-tab-singletab')
        .at(3)
        .props().to,
    ).to.contain('/hairiot');
  });

  it('should render the disruptions tab for terminals', () => {
    const props = {
      breakpoint: 'large',
      children: <div />,
      location: {
        pathname: 'foobar',
      },
      params: {
        terminalId: 'HSL:2211275',
      },
      routes: [],
      stop: {},
    };
    const wrapper = shallowWithIntl(<StopPageTabContainer {...props} />);
    expect(wrapper.find('.stop-tab-singletab')).to.have.lengthOf(4);
  });

  it('should mark the disruptions tab as having an active alert due to a route service alert', () => {
    const props = {
      breakpoint: 'large',
      children: <div />,
      location: {
        pathname: 'foobar',
      },
      params: {
        terminalId: 'HSL:2211275',
      },
      routes: [],
      stop: {
        stoptimesForServiceDate: [
          {
            pattern: {
              route: {
                alerts: [{}],
              },
            },
            stoptimes: [
              {
                realtimeState: 'SCHEDULED',
              },
            ],
          },
        ],
      },
    };
    const wrapper = shallowWithIntl(<StopPageTabContainer {...props} />);
    expect(wrapper.find('.alert-active')).to.have.lengthOf(1);
  });

  it('should mark the disruptions tab as having an active alert due to a cancelation', () => {
    const props = {
      breakpoint: 'large',
      children: <div />,
      location: {
        pathname: 'foobar',
      },
      params: {
        terminalId: 'HSL:2211275',
      },
      routes: [],
      stop: {
        stoptimesForServiceDate: [
          {
            pattern: {
              route: {
                alerts: [],
              },
            },
            stoptimes: [
              {
                realtimeState: 'CANCELED',
              },
            ],
          },
        ],
      },
    };
    const wrapper = shallowWithIntl(<StopPageTabContainer {...props} />);
    expect(wrapper.find('.alert-active')).to.have.lengthOf(1);
  });

  it('should mark the disruptions tab as having an active alert due to a stop service alert', () => {
    const props = {
      breakpoint: 'large',
      children: <div />,
      location: {
        pathname: 'foobar',
      },
      params: {
        terminalId: 'HSL:2211275',
      },
      routes: [],
      stop: {
        alerts: [
          {
            alertSeverityLevel: AlertSeverityLevelType.Warning,
          },
        ],
        stoptimesForServiceDate: [],
      },
    };
    const wrapper = shallowWithIntl(<StopPageTabContainer {...props} />);
    expect(wrapper.find('.alert-active')).to.have.lengthOf(1);
  });

  it('should render empty if stop information is missing', () => {
    const props = {
      breakpoint: 'large',
      children: <div />,
      location: {
        pathname: 'foobar',
      },
      params: {
        terminalId: 'HSL:2211275',
      },
      routes: [],
      stop: null,
    };
    const wrapper = shallowWithIntl(<StopPageTabContainer {...props} />);
    expect(wrapper.isEmptyRender()).to.equal(true);
  });
});
