import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import sinon from 'sinon';

import moment from 'moment';
import { mockContext } from '../helpers/mock-context';
import { mockMatch, mockRouter } from '../helpers/mock-router';
import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import { startRealTimeClient } from '../../../app/action/realTimeClientAction';
import { Component as RoutePageControlPanel } from '../../../app/component/RoutePageControlPanel';
import { AlertSeverityLevelType } from '../../../app/constants';
import { PREFIX_ROUTES, PREFIX_STOPS } from '../../../app/util/path';

describe('<RoutePageControlPanel />', () => {
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
      router: mockRouter,
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
    const wrapper = shallowWithIntl(<RoutePageControlPanel {...props} />, {
      context: {
        ...mockContext,
        config: { CONFIG: 'default', colors: { primary: '#00AFFF' }, URL: {} },
      },
    });
    expect(wrapper.find('.activeAlert')).to.have.lengthOf(1);
  });

  it('should start the real time client after mounting if active pattern is found', () => {
    const activeDates = [{ day: moment().format('YYYYMMDD') }];
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
      router: mockRouter,
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
    const context = {
      ...mockContext,
      config: {
        CONFIG: 'default',
        realTime: {
          tampere: {
            gtfsRt: 'foobar',
            routeSelector: () => '32',
            active: true,
          },
        },
        colors: { primary: '#00AFFF' },
        URL: {},
      },
      executeAction: sinon.stub(),
    };

    shallowWithIntl(<RoutePageControlPanel {...props} />, {
      context,
    });

    expect(context.executeAction.callCount).to.equal(1);
    expect(context.executeAction.args[0][0]).to.equal(startRealTimeClient);
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
      router: mockRouter,
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
    const context = {
      ...mockContext,
      config: {
        CONFIG: 'default',
        realTime: {
          tampere: {
            gtfsRt: 'foobar',
            routeSelector: () => '32',
            active: false,
          },
        },
        colors: { primary: '#00AFFF' },
        URL: {},
      },
      executeAction: sinon.stub(),
    };

    shallowWithIntl(<RoutePageControlPanel {...props} />, {
      context,
    });

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
      router: mockRouter,
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
    const wrapper = shallowWithIntl(<RoutePageControlPanel {...props} />, {
      context: {
        ...mockContext,
        config: { CONFIG: 'default', colors: { primary: '#00AFFF' }, URL: {} },
      },
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
        router: mockRouter,
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
      const wrapper = shallowWithIntl(<RoutePageControlPanel {...props} />, {
        context: {
          ...mockContext,
          config: {
            CONFIG: 'default',
            realTime: { HSL: { active: true } },
            colors: { primary: '#00AFFF' },
            URL: {},
          },
        },
      });
      wrapper.instance().componentDidMount();
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
        router: mockRouter,
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
      const wrapper = shallowWithIntl(<RoutePageControlPanel {...props} />, {
        context: {
          ...mockContext,
          config: {
            CONFIG: 'default',
            realTime: { HSL: { active: true, routeSelector: () => '63' } },
            colors: { primary: '#00AFFF' },
            URL: {},
          },
          getStore: () => ({ client: {} }),
        },
      });
      wrapper.instance().onPatternChange('foobar');
    });
  });

  it('should mark the disruptions tab as having an active info alert due to a route INFO level service alert', () => {
    const props = {
      breakpoint: 'large',
      route: {
        gtfsId: 'HSL:1063',
        mode: 'BUS',
        type: 3,
        agency: { name: 'mock' },
        patterns: [
          {
            alerts: [
              { id: 'foobar', alertSeverityLevel: AlertSeverityLevelType.Info },
            ],
            code: 'HSL:1063:0:01',
          },
        ],
      },
      router: mockRouter,
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
    const wrapper = shallowWithIntl(<RoutePageControlPanel {...props} />, {
      context: {
        ...mockContext,
        config: { CONFIG: 'default', colors: { primary: '#00AFFF' }, URL: {} },
      },
    });
    expect(wrapper.find('.active-service-alert')).to.have.lengthOf(1);
  });

  it('should mark the disruptions tab as having an active info alert due to a route WARNING level service alert', () => {
    const props = {
      breakpoint: 'large',
      location: {
        pathname: `/${PREFIX_ROUTES}/HSL:1063/${PREFIX_STOPS}/HSL:1063:0:01`,
      },
      params: {
        routeId: 'HSL:1063',
        patternId: 'HSL:1063:0:01',
      },
      route: {
        gtfsId: 'HSL:1063',
        mode: 'BUS',
        type: 3,
        agency: { name: 'mock' },
        patterns: [
          {
            alerts: [
              {
                id: 'foobar',
                alertSeverityLevel: AlertSeverityLevelType.Warning,
              },
            ],
            code: 'HSL:1063:0:01',
          },
        ],
      },
      router: mockRouter,
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
    const wrapper = shallowWithIntl(<RoutePageControlPanel {...props} />, {
      context: {
        ...mockContext,
        config: { CONFIG: 'default', colors: { primary: '#00AFFF' }, URL: {} },
      },
    });
    expect(wrapper.find('.active-disruption-alert')).to.have.lengthOf(1);
  });

  it('should mark the disruptions tab as having an active info alert due to a route SEVERE level service alert', () => {
    const props = {
      breakpoint: 'large',
      location: {
        pathname: `/${PREFIX_ROUTES}/HSL:1063/${PREFIX_STOPS}/HSL:1063:0:01`,
      },
      params: {
        routeId: 'HSL:1063',
        patternId: 'HSL:1063:0:01',
      },
      route: {
        gtfsId: 'HSL:1063',
        mode: 'BUS',
        type: 3,
        agency: { name: 'mock' },
        patterns: [
          {
            alerts: [
              {
                id: 'foobar',
                alertSeverityLevel: AlertSeverityLevelType.Severe,
              },
            ],
            code: 'HSL:1063:0:01',
          },
        ],
      },
      router: mockRouter,
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
    const wrapper = shallowWithIntl(<RoutePageControlPanel {...props} />, {
      context: {
        ...mockContext,
        config: { CONFIG: 'default', colors: { primary: '#00AFFF' }, URL: {} },
      },
    });
    expect(wrapper.find('.active-disruption-alert')).to.have.lengthOf(1);
  });
});
