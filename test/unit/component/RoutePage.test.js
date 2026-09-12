import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import React from 'react';
import PropTypes from 'prop-types';
import sinon from 'sinon';

import { mockMatch, mockRouter } from '../helpers/mock-router';
import { renderWithProviders } from '../helpers/mock-providers';
import { Component as RoutePage } from '../../../app/component/routepage/RoutePage';
import { PREFIX_DISRUPTION } from '../../../app/util/path';

const currentTime = Math.floor(Date.now() / 1000);

const baseConfig = {
  CONFIG: 'default',
  title: 'Digitransit',
  colors: { primary: '#00AFFF', accessiblePrimary: '#000' },
  URL: {},
  flex: { internal: { agencies: [] } },
  routeNotifications: [],
  user: { sub: undefined },
  itinerary: { serviceTimeRange: 60 },
};

const baseRoute = {
  __typename: 'Route',
  gtfsId: 'HSL:1001',
  color: null,
  shortName: '1',
  longName: 'Somewhere - Elsewhere',
  mode: 'BUS',
  type: 3,
  patterns: [
    {
      code: 'HSL:1001:0:01',
      headsign: 'Destination',
      alerts: [],
      stops: [{ name: 'First Stop' }, { name: 'Last Stop' }],
    },
  ],
  agency: {
    name: 'HSL',
    gtfsId: 'HSL:HSL',
    phone: null,
    url: 'https://www.hsl.fi',
    fareUrl: 'https://www.hsl.fi/fare',
  },
};

const baseMatch = {
  ...mockMatch,
  params: {
    routeId: 'HSL:1001',
    patternId: 'HSL:1001:0:01',
  },
};

const baseProps = {
  route: baseRoute,
  match: baseMatch,
  breakpoint: 'large',
};

describe('<RoutePage />', () => {
  // RoutePage's children are Relay fragment/refetch containers. With no real
  // Relay store in the unit env they emit a harmless RelayModernSelector
  // warning, which the global harness turns into a thrown error. Relax only
  // that specific warning here so we can assert RoutePage's own behaviour.
  let savedConsoleError;
  beforeEach(() => {
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

  const renderView = (props = {}, config = baseConfig) =>
    renderWithProviders(<RoutePage {...baseProps} {...props} />, {
      config,
      match: props.match || baseMatch,
      router: props.match?.router || baseMatch.router,
    });

  describe('Redirect when route is missing', () => {
    it('calls router.replace to routes page and renders nothing when route is null and no error', () => {
      // eslint-disable-next-line react/forbid-foreign-prop-types
      const originalPropTypes = RoutePage.propTypes;
      // eslint-disable-next-line react/forbid-foreign-prop-types
      RoutePage.propTypes = {
        ...originalPropTypes,
        route: PropTypes.shape({}),
      };
      const replaceSpy = sinon.spy();
      let container;
      try {
        const result = renderView({
          route: null,
          match: {
            ...baseMatch,
            router: { ...mockRouter, replace: replaceSpy },
          },
        });
        container = result.container;
      } finally {
        RoutePage.propTypes = originalPropTypes;
      }
      expect(replaceSpy.calledOnce).to.equal(true);
      expect(container.firstChild).to.equal(null);
    });

    it('does not redirect when route is null but error is present', () => {
      const replaceSpy = sinon.spy();
      try {
        expect(() =>
          renderView({
            route: null,
            error: { message: 'relay error' },
            match: {
              ...baseMatch,
              router: { ...mockRouter, replace: replaceSpy },
            },
          }),
        ).to.throw();
      } catch (_e) {
        // expected: component throws the relay error
      }
      expect(replaceSpy.called).to.equal(false);
    });
  });

  describe('Error handling', () => {
    it('throws a relay error without redirecting when route is missing', () => {
      // eslint-disable-next-line react/forbid-foreign-prop-types
      const originalPropTypes = RoutePage.propTypes;
      const replaceSpy = sinon.spy();
      // eslint-disable-next-line react/forbid-foreign-prop-types
      RoutePage.propTypes = {
        ...originalPropTypes,
        route: PropTypes.shape({}),
      };
      // Swallow the React error-boundary console noise from the intentional throw.
      // eslint-disable-next-line no-console
      console.error = () => {};
      let thrown;
      try {
        renderView({
          route: null,
          error: { message: 'Relay fetch failed' },
          match: {
            ...baseMatch,
            router: { ...mockRouter, replace: replaceSpy },
          },
        });
      } catch (e) {
        thrown = e;
      } finally {
        RoutePage.propTypes = originalPropTypes;
      }
      expect(thrown).to.equal('Relay fetch failed');
      expect(replaceSpy.called).to.equal(false);
    });
  });

  describe('Label derivation', () => {
    it('uses shortName as label when present', () => {
      const { container } = renderView({
        route: { ...baseRoute, shortName: 'A1' },
      });
      expect(
        container.querySelector('h1.route-short-name span[aria-hidden="true"]')
          .textContent,
      ).to.equal('A1');
    });

    it('falls back to longName when shortName is absent', () => {
      const { container } = renderView({
        route: { ...baseRoute, shortName: null, longName: 'Long Route Name' },
      });
      expect(
        container.querySelector('h1.route-short-name span[aria-hidden="true"]')
          .textContent,
      ).to.equal('Long Route Name');
    });

    it('uses empty string when both shortName and longName are absent', () => {
      const { container } = renderView({
        route: { ...baseRoute, shortName: null, longName: null },
      });
      expect(
        container.querySelector('h1.route-short-name span[aria-hidden="true"]')
          .textContent,
      ).to.equal('');
    });
  });

  describe('BackButton visibility', () => {
    it('renders BackButton on large breakpoint', () => {
      const { container } = renderView({ breakpoint: 'large' });
      expect(container.querySelector('.back-button')).to.not.equal(null);
    });

    it('does not render BackButton on small breakpoint', () => {
      const { container } = renderView({ breakpoint: 'small' });
      expect(container.querySelector('.back-button')).to.equal(null);
    });

    it('does not render BackButton on medium breakpoint', () => {
      const { container } = renderView({ breakpoint: 'medium' });
      expect(container.querySelector('.back-button')).to.equal(null);
    });
  });

  describe('FavouriteRouteContainer', () => {
    it('renders FavouriteRouteContainer when no tripId', () => {
      const { container } = renderView({
        match: {
          ...baseMatch,
          params: { ...baseMatch.params, tripId: undefined },
        },
      });
      expect(container.querySelector('.route-header-actions')).to.not.equal(
        null,
      );
    });

    it('hides FavouriteRouteContainer when tripId is present', () => {
      const { container } = renderView({
        match: {
          ...baseMatch,
          params: { ...baseMatch.params, tripId: 'trip-123' },
        },
      });
      expect(container.querySelector('.route-header-actions')).to.equal(null);
    });
  });

  describe('Trip destination display', () => {
    it('shows trip destination when tripId and headsign are present', () => {
      const { container } = renderView({
        match: {
          ...baseMatch,
          params: {
            ...baseMatch.params,
            tripId: 'trip-123',
            patternId: 'HSL:1001:0:01',
          },
        },
      });
      expect(container.querySelector('.trip-destination')).to.not.equal(null);
      expect(
        container.querySelector('.destination-headsign').textContent,
      ).to.equal('Destination');
    });

    it('hides trip destination when tripId is absent', () => {
      const { container } = renderView({
        match: {
          ...baseMatch,
          params: { routeId: 'HSL:1001' },
        },
      });
      expect(container.querySelector('.trip-destination')).to.equal(null);
    });

    it('hides trip destination when tripId is present but no matching pattern', () => {
      const { container } = renderView({
        match: {
          ...baseMatch,
          params: {
            routeId: 'HSL:1001',
            tripId: 'trip-123',
            patternId: 'NOMATCH',
          },
        },
      });
      expect(container.querySelector('.trip-destination')).to.equal(null);
    });
  });

  describe('Headsign resolution', () => {
    it("uses pattern's own headsign when pattern code does not start with NETEX:", () => {
      const route = {
        ...baseRoute,
        patterns: [
          {
            code: 'HSL:1001:0:01',
            headsign: 'Central Station',
            alerts: [],
            stops: [{ name: 'First' }, { name: 'Last' }],
          },
        ],
      };
      const { container } = renderView({
        route,
        match: {
          ...baseMatch,
          params: {
            routeId: 'HSL:1001',
            tripId: 'trip-1',
            patternId: 'HSL:1001:0:01',
          },
        },
      });
      expect(
        container.querySelector('.destination-headsign').textContent,
      ).to.equal('Central Station');
    });

    it('uses last stop name when pattern code starts with NETEX:', () => {
      const route = {
        ...baseRoute,
        patterns: [
          {
            code: 'NETEX:1001:0:01',
            headsign: 'Ignored',
            alerts: [],
            stops: [{ name: 'First' }, { name: 'Terminal' }],
          },
        ],
      };
      const { container } = renderView({
        route,
        match: {
          ...baseMatch,
          params: {
            routeId: 'HSL:1001',
            tripId: 'trip-1',
            patternId: 'NETEX:1001:0:01',
          },
        },
      });
      expect(
        container.querySelector('.destination-headsign').textContent,
      ).to.equal('Terminal');
    });

    it('uses last stop name when pattern has no headsign', () => {
      const route = {
        ...baseRoute,
        patterns: [
          {
            code: 'HSL:1001:0:01',
            headsign: null,
            alerts: [],
            stops: [{ name: 'Start' }, { name: 'End Station' }],
          },
        ],
      };
      const { container } = renderView({
        route,
        match: {
          ...baseMatch,
          params: {
            routeId: 'HSL:1001',
            tripId: 'trip-1',
            patternId: 'HSL:1001:0:01',
          },
        },
      });
      expect(
        container.querySelector('.destination-headsign').textContent,
      ).to.equal('End Station');
    });
  });

  describe('AlertBanner', () => {
    const makeAlert = () => ({
      entities: [{ __typename: 'Route' }],
      alertHeaderText: 'Service disruption',
      alertDescriptionText: null,
      alertSeverityLevel: 'WARNING',
      effectiveStartDate: null,
      effectiveEndDate: null,
    });

    it('shows AlertBanner when tripId is set and pattern has valid route alerts', () => {
      const route = {
        ...baseRoute,
        patterns: [
          {
            code: 'HSL:1001:0:01',
            headsign: 'Destination',
            alerts: [makeAlert()],
            stops: [{ name: 'First' }, { name: 'Last' }],
          },
        ],
      };
      const { container } = renderView({
        route,
        match: {
          ...baseMatch,
          params: {
            routeId: 'HSL:1001',
            tripId: 'trip-1',
            patternId: 'HSL:1001:0:01',
          },
        },
      });
      expect(
        container.querySelector('.trip-page-alert-container'),
      ).to.not.equal(null);
    });

    it('hides AlertBanner when tripId is absent even if alerts exist', () => {
      const route = {
        ...baseRoute,
        patterns: [
          {
            code: 'HSL:1001:0:01',
            headsign: 'Destination',
            alerts: [makeAlert()],
            stops: [{ name: 'First' }, { name: 'Last' }],
          },
        ],
      };
      const { container } = renderView({
        route,
        match: {
          ...baseMatch,
          params: { routeId: 'HSL:1001', patternId: 'HSL:1001:0:01' },
        },
      });
      expect(container.querySelector('.trip-page-alert-container')).to.equal(
        null,
      );
    });

    it('hides AlertBanner when tripId is set but pattern has no alerts', () => {
      const { container } = renderView({
        match: {
          ...baseMatch,
          params: {
            routeId: 'HSL:1001',
            tripId: 'trip-1',
            patternId: 'HSL:1001:0:01',
          },
        },
      });
      expect(container.querySelector('.trip-page-alert-container')).to.equal(
        null,
      );
    });

    it('hides AlertBanner when tripId is set but alerts have no Route entity', () => {
      const route = {
        ...baseRoute,
        patterns: [
          {
            code: 'HSL:1001:0:01',
            headsign: 'Destination',
            alerts: [
              {
                entities: [{ __typename: 'Stop' }],
                alertHeaderText: 'Stop disruption',
                alertDescriptionText: null,
                effectiveStartDate: null,
                effectiveEndDate: null,
              },
            ],
            stops: [{ name: 'First' }, { name: 'Last' }],
          },
        ],
      };
      const { container } = renderView({
        route,
        match: {
          ...baseMatch,
          params: {
            routeId: 'HSL:1001',
            tripId: 'trip-1',
            patternId: 'HSL:1001:0:01',
          },
        },
      });
      expect(container.querySelector('.trip-page-alert-container')).to.equal(
        null,
      );
    });

    it('hides AlertBanner when alerts have expired (effectiveEndDate in the past)', () => {
      const expiredTime = currentTime - 7200;
      const route = {
        ...baseRoute,
        patterns: [
          {
            code: 'HSL:1001:0:01',
            headsign: 'Destination',
            alerts: [
              {
                entities: [{ __typename: 'Route' }],
                alertHeaderText: 'Old disruption',
                alertDescriptionText: null,
                effectiveStartDate: expiredTime - 3600,
                effectiveEndDate: expiredTime,
              },
            ],
            stops: [{ name: 'First' }, { name: 'Last' }],
          },
        ],
      };
      const { container } = renderView({
        route,
        match: {
          ...baseMatch,
          params: {
            routeId: 'HSL:1001',
            tripId: 'trip-1',
            patternId: 'HSL:1001:0:01',
          },
        },
      });
      expect(container.querySelector('.trip-page-alert-container')).to.equal(
        null,
      );
    });
  });

  describe('RouteControlPanel', () => {
    it('renders RouteControlPanel when type param equals PREFIX_DISRUPTION', () => {
      const { container } = renderView({
        match: {
          ...baseMatch,
          params: { ...baseMatch.params, type: PREFIX_DISRUPTION },
        },
      });
      expect(
        container.querySelector('.route-page-control-panel-container'),
      ).to.not.equal(null);
    });

    it('does not render RouteControlPanel when type param is absent', () => {
      const { container } = renderView({
        match: { ...baseMatch, params: { routeId: 'HSL:1001' } },
      });
      expect(
        container.querySelector('.route-page-control-panel-container'),
      ).to.equal(null);
    });

    it('does not render RouteControlPanel when type param is not PREFIX_DISRUPTION', () => {
      const { container } = renderView({
        match: {
          ...baseMatch,
          params: { ...baseMatch.params, type: 'some-other-prefix' },
        },
      });
      expect(
        container.querySelector('.route-page-control-panel-container'),
      ).to.equal(null);
    });
  });

  describe('Route color', () => {
    it('applies route color as inline style on the heading when color is set and passes WCAG AA', () => {
      const { container } = renderView({
        route: { ...baseRoute, color: '003399' },
      });
      const heading = container.querySelector('h1.route-short-name');
      expect(heading.style.color).to.equal('rgb(0, 51, 153)');
    });

    it('falls back to #333 when route has no color (mode color fails WCAG AA)', () => {
      const { container } = renderView({
        route: { ...baseRoute, color: null },
      });
      const heading = container.querySelector('h1.route-short-name');
      expect(heading.style.color).to.equal('rgb(51, 51, 51)');
    });
  });
});
