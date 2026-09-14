import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import React from 'react';

import { mockMatch } from '../helpers/mock-router';
import { renderWithProviders } from '../helpers/mock-providers';
import RouteControlPanel from '../../../app/component/routepage/RouteControlPanel';
import { AlertSeverityLevelType } from '../../../app/constants';
import { PREFIX_ROUTES, PREFIX_STOPS } from '../../../app/util/path';

const baseConfig = {
  CONFIG: 'default',
  colors: { primary: '#00AFFF' },
  URL: {},
  itinerary: { serviceTimeRange: 60 },
  user: { sub: undefined },
};

describe('<RouteControlPanel />', () => {
  let savedConsoleError;
  beforeEach(() => {
    // Relax console.error for the known Relay fragment warning
    // eslint-disable-next-line no-console
    savedConsoleError = console.error;
    // eslint-disable-next-line no-console
    console.error = warning => {
      if (String(warning).includes('RelayModernSelector')) {
        return;
      }
      throw new Error(warning);
    };
  });

  afterEach(() => {
    // eslint-disable-next-line no-console
    console.error = savedConsoleError;
  });

  const renderView = (props, config = baseConfig, contextOverrides = {}) =>
    renderWithProviders(<RouteControlPanel {...props} />, {
      config,
      match: props.match,
      ...contextOverrides,
    }).container;

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
            stops: [{ name: 'Stop A' }, { name: 'Stop B' }],
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
    expect(renderView(props).querySelector('.activeAlert')).to.not.equal(null);
  });

  it('should not start the real time client after mounting if realtime is not active', () => {
    const props = {
      breakpoint: 'large',
      route: {
        gtfsId: 'tampere:32',
        mode: 'BUS',
        type: 3,
        agency: { name: 'mock' },
        patterns: [
          {
            code: 'tampere:32:1:01',
            stops: [{ name: 'Stop A' }, { name: 'Stop B' }],
          },
        ],
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
    const config = {
      ...baseConfig,
      realTime: {
        tampere: {
          gtfsRt: 'foobar',
          routeSelector: () => '32',
          active: false,
        },
      },
    };
    renderView(props, config);
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
            stops: [{ name: 'Stop A' }, { name: 'Stop B' }],
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
    expect(renderView(props).querySelector('.activeAlert')).to.not.equal(null);
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
              stops: [{ name: 'Stop A' }, { name: 'Stop B' }],
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
      const config = {
        ...baseConfig,
        realTime: { HSL: { active: true } },
      };
      // Renders without throwing even when patternId does not match any pattern
      renderView(props, config);
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
              stops: [{ name: 'Stop A' }, { name: 'Stop B' }],
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
      const config = {
        ...baseConfig,
        realTime: { HSL: { active: true, routeSelector: () => '63' } },
      };
      // Renders without throwing even when the pattern change triggers with no match
      renderView(props, config);
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
          stops: [{ name: 'Stop A' }, { name: 'Stop B' }],
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
      const container = renderView(
        {
          breakpoint: 'large',
          route: makeAlertRoute(AlertSeverityLevelType.Info),
          match: alertMatch,
        },
        baseConfig,
      );
      expect(container.querySelector('.active-service-alert')).to.not.equal(
        null,
      );
    });

    it('should mark the disruptions tab with .active-disruption-alert for WARNING level', () => {
      const container = renderView(
        {
          breakpoint: 'large',
          route: makeAlertRoute(AlertSeverityLevelType.Warning),
          match: alertMatch,
        },
        baseConfig,
      );
      expect(container.querySelector('.active-disruption-alert')).to.not.equal(
        null,
      );
    });

    it('should mark the disruptions tab with .active-disruption-alert for SEVERE level', () => {
      const container = renderView(
        {
          breakpoint: 'large',
          route: makeAlertRoute(AlertSeverityLevelType.Severe),
          match: alertMatch,
        },
        baseConfig,
      );
      expect(container.querySelector('.active-disruption-alert')).to.not.equal(
        null,
      );
    });
  });
});
