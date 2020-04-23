import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import { FormattedMessage } from 'react-intl';
import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import { AlertSeverityLevelType } from '../../../app/constants';
import { Component as StopPageTabContainer } from '../../../app/component/StopPageTabContainer';
import { PREFIX_DISRUPTION } from '../../../app/util/path';

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
    ).to.contain(`/${PREFIX_DISRUPTION}`);
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
        stoptimes: [
          {
            realtimeState: 'SCHEDULED',
            trip: {
              route: {
                alerts: [{}],
              },
            },
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
        stoptimes: [
          {
            realtimeState: 'CANCELED',
            trip: {
              route: {
                alerts: [],
              },
            },
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

  it('should mark the disruptions tab as having an active disruption alert due to a stop SEVERE level service alert', () => {
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
            alertSeverityLevel: AlertSeverityLevelType.Severe,
          },
        ],
        stoptimesForServiceDate: [],
      },
    };
    const wrapper = shallowWithIntl(<StopPageTabContainer {...props} />);
    expect(wrapper.find('.active-disruption-alert')).to.have.lengthOf(2);
  });

  it('should mark the disruptions tab as having an active disruption alert due to a stop WARNING level service alert', () => {
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
    expect(wrapper.find('.active-disruption-alert')).to.have.lengthOf(2);
  });

  it('should mark the disruptions tab as having an active info alert due to a stop UNKNOWN_SEVERITY level service alert', () => {
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
            alertSeverityLevel: AlertSeverityLevelType.Unkown,
          },
        ],
        stoptimesForServiceDate: [],
      },
    };
    const wrapper = shallowWithIntl(<StopPageTabContainer {...props} />);
    expect(wrapper.find('.active-disruption-alert')).to.have.lengthOf(2);
  });

  it('should mark the disruptions tab as having an active info alert due to a stop INFO level service alert', () => {
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
            alertSeverityLevel: AlertSeverityLevelType.Info,
          },
        ],
        stoptimesForServiceDate: [],
      },
    };
    const wrapper = shallowWithIntl(<StopPageTabContainer {...props} />);
    expect(wrapper.find('.active-service-alert')).to.have.lengthOf(2);
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

  it('should render "Routes, tracks" when vehicleMode is rail', () => {
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
      stop: {
        vehicleMode: 'RAIL',
      },
    };
    const wrapper = shallowWithIntl(<StopPageTabContainer {...props} />);
    expect(
      wrapper
        .find(FormattedMessage)
        .at(2)
        .props().id,
    ).to.equal('routes-tracks');
  });

  it('should render "Routes, tracks" when vehicleMode is subway', () => {
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
      stop: {
        vehicleMode: 'SUBWAY',
      },
    };
    const wrapper = shallowWithIntl(<StopPageTabContainer {...props} />);
    expect(
      wrapper
        .find(FormattedMessage)
        .at(2)
        .props().id,
    ).to.equal('routes-tracks');
  });

  it('should render "Routes, platforms" when vehicleMode is not rail or subway', () => {
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
    expect(
      wrapper
        .find(FormattedMessage)
        .at(2)
        .props().id,
    ).to.equal('routes-platforms');
  });
});

// DT-3387
it('should render "Routes, platforms" when vehicleMode is rail but route´s mode is bus', () => {
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
    stop: {
      vehicleMode: 'RAIL',
      routes: [
        {
          mode: 'BUS',
          patterns: [
            {
              code: 'HSL:9665A:0:02',
            },
          ],
        },
      ],
    },
  };
  const wrapper = shallowWithIntl(<StopPageTabContainer {...props} />);
  expect(
    wrapper
      .find(FormattedMessage)
      .at(2)
      .props().id,
  ).to.equal('routes-platforms');
});

it('should render "Routes, platforms" when vehicleMode is subway but route´s mode is bus', () => {
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
    stop: {
      vehicleMode: 'SUBWAY',
      routes: [
        {
          mode: 'BUS',
          patterns: [
            {
              code: 'HSL:9665A:0:02',
            },
          ],
        },
      ],
    },
  };
  const wrapper = shallowWithIntl(<StopPageTabContainer {...props} />);
  expect(
    wrapper
      .find(FormattedMessage)
      .at(2)
      .props().id,
  ).to.equal('routes-platforms');
});
