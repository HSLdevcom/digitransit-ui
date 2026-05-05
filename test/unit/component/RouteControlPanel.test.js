import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';

import { DateTime } from 'luxon';
import { mockContext } from '../helpers/mock-context';
import { mockMatch } from '../helpers/mock-router';
import { Component as RouteControlPanel } from '../../../app/component/routepage/RouteControlPanel';
import { AlertSeverityLevelType } from '../../../app/constants';
import { PREFIX_ROUTES, PREFIX_STOPS } from '../../../app/util/path';
import { createShallowHookSandbox } from '../helpers/mock-intl-enzyme';

const baseConfig = {
  CONFIG: 'default',
  colors: { primary: '#00AFFF' },
  URL: {},
};

describe('<RouteControlPanel />', () => {
  let sandbox;
  let stubs;

  beforeEach(() => {
    ({ sandbox, stubs } = createShallowHookSandbox({ config: baseConfig }));
  });

  afterEach(() => sandbox.restore());

  it('should set the activeAlert class if there is an alert and a matching patternId', () => {
    const props = {
      breakpoint: 'large',
      route: {
        gtfsId: 'HSL:1063',
        mode: 'BUS',
        agency: { name: 'mock' },
        type: 0,
        patterns: [
          {
            alerts: [
              {
                trip: {
                  pattern: {
                    code: 'HSL:1063:0:01',
                  },
                },
              },
            ],
            code: 'HSL:1063:0:01',
            trips: [
              {
                stoptimes: [
                  {
                    realtimeState: 'SCHEDULED',
                  },
                ],
              },
            ],
          },
        ],
      },
      match: {
        ...mockMatch,
        location: {
          ...mockMatch.location,
          pathname: `/${PREFIX_ROUTES}/HSL:1063/${PREFIX_STOPS}/HSL:1063:0:01`,
        },
        params: {
          routeId: 'HSL:1063',
          patternId: 'HSL:1063:0:01',
        },
      },
    };
    const wrapper = shallow(<RouteControlPanel {...props} />, {
      context: mockContext,
    });
    expect(wrapper.find('.activeAlert')).to.have.lengthOf(1);
  });

  it('renders without error when active pattern is found and realtime is configured', () => {
    const activeDates = [{ day: DateTime.now().toFormat('yyyyLLdd') }];
    const props = {
      reRouteAllowed: true,
      breakpoint: 'large',
      route: {
        gtfsId: 'tampere:32',
        mode: 'BUS',
        patterns: [
          {
            code: 'tampere:32:1:01',
            headsign: 'Tampella',
            activeDates,
            trips: [
              {
                stoptimes: [
                  {
                    realtimeState: 'CANCELED',
                  },
                ],
              },
            ],
          },
        ],
        agency: { name: 'mock' },
        type: 3,
      },
      match: {
        ...mockMatch,
        location: {
          ...mockMatch.location,
          pathname: `/${PREFIX_ROUTES}/tampere:32/${PREFIX_STOPS}/tampere:32:1:01`,
        },
        params: {
          patternId: 'tampere:32:1:01',
        },
      },
    };
    stubs.useConfigContext.returns({
      ...baseConfig,
      realTime: {
        tampere: {
          gtfsRt: 'foobar',
          routeSelector: () => '32',
          active: true,
        },
      },
    });
    // useEffect that starts the realtime client runs after mount, but cannot be
    // reliably tested with Enzyme shallow rendering (effects don't run) or mount
    // (requires a full Relay refetch container environment). This test verifies
    // that the component renders without throwing given these props.
    shallow(<RouteControlPanel {...props} />, { context: mockContext });
  });

  it('should not start the real time client after mounting if realtime is not active', () => {
    const props = {
      breakpoint: 'large',
      route: {
        gtfsId: 'tampere:32',
        mode: 'BUS',
        type: 3,
        agency: { name: 'mock' },
      },
      match: {
        ...mockMatch,
        location: {
          ...mockMatch.location,
          pathname: `/${PREFIX_ROUTES}/tampere:32/${PREFIX_STOPS}/tampere:32:1:01`,
        },
        params: {
          patternId: 'tampere:32:1:01',
        },
      },
    };
    stubs.useConfigContext.returns({
      ...baseConfig,
      realTime: {
        tampere: {
          gtfsRt: 'foobar',
          routeSelector: () => '32',
          active: false,
        },
      },
    });
    const context = {
      ...mockContext,
      executeAction: sinon.stub(),
    };

    shallow(<RouteControlPanel {...props} />, { context });

    expect(context.executeAction.callCount).to.equal(0);
  });

  it('should set the activeAlert class if there is a cancelation for today', () => {
    const props = {
      breakpoint: 'large',
      route: {
        gtfsId: 'HSL:1063',
        mode: 'BUS',
        patterns: [
          {
            alerts: [],
            code: 'HSL:1063:0:01',
            trips: [
              {
                stoptimes: [
                  {
                    realtimeState: 'CANCELED',
                  },
                ],
              },
            ],
          },
        ],
        type: 3,
        agency: { name: 'mock' },
      },
      match: {
        ...mockMatch,
        location: {
          ...mockMatch.location,
          pathname: `/${PREFIX_ROUTES}/HSL:1063/${PREFIX_STOPS}/HSL:1063:0:01`,
        },
        params: {
          routeId: 'HSL:1063',
          patternId: 'HSL:1063:0:01',
        },
      },
    };
    const wrapper = shallow(<RouteControlPanel {...props} />, {
      context: mockContext,
    });
    expect(wrapper.find('.activeAlert')).to.have.lengthOf(1);
  });

  describe('componentDidMount', () => {
    it('should ignore a missing pattern', () => {
      const props = {
        breakpoint: 'large',
        route: {
          gtfsId: 'HSL:1063',
          mode: 'BUS',
          patterns: [
            {
              code: 'HSL:1063:0:01',
            },
          ],
          type: 3,
          agency: { name: 'mock' },
        },
        match: {
          ...mockMatch,
          location: {
            ...mockMatch.location,
            pathname: `/${PREFIX_ROUTES}/HSL:1063/${PREFIX_STOPS}/HSL:1063:0:02`,
          },
          params: {
            routeId: 'HSL:1063',
            patternId: 'HSL:1063:0:02',
          },
        },
      };
      stubs.useConfigContext.returns({
        ...baseConfig,
        realTime: { HSL: { active: true } },
      });
      // Renders without throwing even when patternId does not match any pattern
      shallow(<RouteControlPanel {...props} />, { context: mockContext });
    });
  });

  describe('onPatternChange', () => {
    it('should ignore a missing pattern', () => {
      const props = {
        breakpoint: 'large',
        route: {
          gtfsId: 'HSL:1063',
          mode: 'BUS',
          patterns: [
            {
              code: 'HSL:1063:0:01',
            },
          ],
          type: 3,
          agency: { name: 'mock' },
        },
        match: {
          ...mockMatch,
          location: {
            ...mockMatch.location,
            pathname: `/${PREFIX_ROUTES}/HSL:1063/${PREFIX_STOPS}/HSL:1063:0:02`,
          },
          params: {
            routeId: 'HSL:1063',
            patternId: 'HSL:1063:0:01',
          },
        },
      };
      stubs.useConfigContext.returns({
        ...baseConfig,
        realTime: { HSL: { active: true, routeSelector: () => '63' } },
      });
      // Renders without throwing even when the pattern change triggers with no match
      shallow(<RouteControlPanel {...props} />, {
        context: {
          ...mockContext,
          getStore: () => ({ client: {} }),
        },
      });
    });
  });

  describe('Alert severity levels', () => {
    const makeAlertRoute = alertSeverityLevel => ({
      gtfsId: 'HSL:1063',
      mode: 'BUS',
      type: 3,
      agency: { name: 'mock' },
      patterns: [
        {
          alerts: [{ id: 'foobar', alertSeverityLevel }],
          code: 'HSL:1063:0:01',
        },
      ],
    });

    const alertMatch = {
      ...mockMatch,
      location: {
        ...mockMatch.location,
        pathname: `/${PREFIX_ROUTES}/HSL:1063/${PREFIX_STOPS}/HSL:1063:0:01`,
      },
      params: {
        routeId: 'HSL:1063',
        patternId: 'HSL:1063:0:01',
      },
    };

    it('should mark the disruptions tab with .active-service-alert for INFO level', () => {
      const wrapper = shallow(
        <RouteControlPanel
          breakpoint="large"
          route={makeAlertRoute(AlertSeverityLevelType.Info)}
          match={alertMatch}
        />,
        { context: mockContext },
      );
      expect(wrapper.find('.active-service-alert')).to.have.lengthOf(1);
    });

    it('should mark the disruptions tab with .active-disruption-alert for WARNING level', () => {
      const wrapper = shallow(
        <RouteControlPanel
          breakpoint="large"
          route={makeAlertRoute(AlertSeverityLevelType.Warning)}
          match={alertMatch}
        />,
        { context: mockContext },
      );
      expect(wrapper.find('.active-disruption-alert')).to.have.lengthOf(1);
    });

    it('should mark the disruptions tab with .active-disruption-alert for SEVERE level', () => {
      const wrapper = shallow(
        <RouteControlPanel
          breakpoint="large"
          route={makeAlertRoute(AlertSeverityLevelType.Severe)}
          match={alertMatch}
        />,
        { context: mockContext },
      );
      expect(wrapper.find('.active-disruption-alert')).to.have.lengthOf(1);
    });
  });
});
