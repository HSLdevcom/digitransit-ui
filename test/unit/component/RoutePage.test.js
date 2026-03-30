import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import React from 'react';
import PropTypes from 'prop-types';
import sinon from 'sinon';
import { shallow } from 'enzyme';

import * as useTranslationsContextModule from '../../../app/util/useTranslationsContext';
import * as ConfigContextModule from '../../../app/configurations/ConfigContext';
import { mockMatch, mockRouter } from '../helpers/mock-router';
import { Component as RoutePage } from '../../../app/component/routepage/RoutePage';
import BackButton from '../../../app/component/BackButton';
import AlertBanner from '../../../app/component/AlertBanner';
import RouteControlPanel from '../../../app/component/routepage/RouteControlPanel';
import FavouriteRouteContainer from '../../../app/component/routepage/FavouriteRouteContainer';
import { PREFIX_DISRUPTION } from '../../../app/util/path';

const currentTime = Math.floor(Date.now() / 1000);

const baseConfig = {
  CONFIG: 'default',
  title: 'Digitransit',
  colors: { primary: '#00AFFF', accessiblePrimary: '#000' },
  URL: {},
  flex: { internalAgencies: [] },
};

const baseIntl = {
  formatMessage: ({ id }) => id,
  locale: 'en',
};

const baseRoute = {
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
  currentTime,
};

describe('<RoutePage />', () => {
  let sandbox;
  let configStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox
      .stub(useTranslationsContextModule, 'useTranslationsContext')
      .returns(baseIntl);
    configStub = sandbox
      .stub(ConfigContextModule, 'useConfigContext')
      .returns(baseConfig);
  });

  afterEach(() => {
    sandbox.restore();
  });

  const render = (props = {}) =>
    shallow(<RoutePage {...baseProps} {...props} />);

  describe('Redirect when route is missing', () => {
    it('calls router.replace to routes page and renders nothing when route is null and no error', () => {
      // Temporarily make `route` not required to suppress propType warnings
      // when deliberately testing the null-route redirect path.
      // eslint-disable-next-line react/forbid-foreign-prop-types
      const originalPropTypes = RoutePage.propTypes;
      // eslint-disable-next-line react/forbid-foreign-prop-types, react/forbid-prop-types
      RoutePage.propTypes = {
        ...originalPropTypes,
        route: PropTypes.shape({}),
      };
      const replaceSpy = sinon.spy();
      let wrapper;
      try {
        wrapper = render({
          route: null,
          match: {
            ...baseMatch,
            router: { ...mockRouter, replace: replaceSpy },
          },
        });
      } finally {
        RoutePage.propTypes = originalPropTypes;
      }
      expect(replaceSpy.calledOnce).to.equal(true);
      expect(wrapper.type()).to.equal(null);
    });

    it('does not redirect when route is null but error is present', () => {
      const replaceSpy = sinon.spy();
      // When error is set and route is null the component throws before
      // reaching the redirect guard, so replace should never be called.
      try {
        render({
          route: null,
          error: { message: 'relay error' },
          match: {
            ...baseMatch,
            router: { ...mockRouter, replace: replaceSpy },
          },
        });
      } catch (_e) {
        // expected: component throws the relay error
      }
      expect(replaceSpy.called).to.equal(false);
    });
  });

  describe('Error handling', () => {
    it('throws when rendered with a relay error and no route', () => {
      // eslint-disable-next-line react/forbid-foreign-prop-types
      const originalPropTypes = RoutePage.propTypes;
      // eslint-disable-next-line react/forbid-foreign-prop-types, react/forbid-prop-types
      RoutePage.propTypes = {
        ...originalPropTypes,
        route: PropTypes.shape({}),
      };
      try {
        expect(() =>
          render({ route: null, error: { message: 'Relay fetch failed' } }),
        ).to.throw();
      } finally {
        RoutePage.propTypes = originalPropTypes;
      }
    });
  });

  describe('Label derivation', () => {
    it('uses shortName as label when present', () => {
      const wrapper = render({ route: { ...baseRoute, shortName: 'A1' } });
      expect(wrapper.find('span[aria-hidden="true"]').text()).to.equal('A1');
    });

    it('falls back to longName when shortName is absent', () => {
      const wrapper = render({
        route: { ...baseRoute, shortName: null, longName: 'Long Route Name' },
      });
      expect(wrapper.find('span[aria-hidden="true"]').text()).to.equal(
        'Long Route Name',
      );
    });

    it('uses empty string when both shortName and longName are absent', () => {
      const wrapper = render({
        route: { ...baseRoute, shortName: null, longName: null },
      });
      expect(wrapper.find('span[aria-hidden="true"]').text()).to.equal('');
    });
  });

  describe('BackButton visibility', () => {
    it('renders BackButton on large breakpoint', () => {
      const wrapper = render({ breakpoint: 'large' });
      expect(wrapper.find(BackButton)).to.have.lengthOf(1);
    });

    it('does not render BackButton on small breakpoint', () => {
      const wrapper = render({ breakpoint: 'small' });
      expect(wrapper.find(BackButton)).to.have.lengthOf(0);
    });

    it('does not render BackButton on medium breakpoint', () => {
      const wrapper = render({ breakpoint: 'medium' });
      expect(wrapper.find(BackButton)).to.have.lengthOf(0);
    });
  });

  describe('FavouriteRouteContainer', () => {
    it('renders FavouriteRouteContainer when no tripId', () => {
      const wrapper = render({
        match: {
          ...baseMatch,
          params: { ...baseMatch.params, tripId: undefined },
        },
      });
      expect(wrapper.find(FavouriteRouteContainer)).to.have.lengthOf(1);
    });

    it('hides FavouriteRouteContainer when tripId is present', () => {
      const wrapper = render({
        match: {
          ...baseMatch,
          params: { ...baseMatch.params, tripId: 'trip-123' },
        },
      });
      expect(wrapper.find(FavouriteRouteContainer)).to.have.lengthOf(0);
    });
  });

  describe('Trip destination display', () => {
    it('shows trip destination when tripId and headsign are present', () => {
      const wrapper = render({
        match: {
          ...baseMatch,
          params: {
            ...baseMatch.params,
            tripId: 'trip-123',
            patternId: 'HSL:1001:0:01',
          },
        },
      });
      expect(wrapper.find('.trip-destination')).to.have.lengthOf(1);
      expect(wrapper.find('.destination-headsign').text()).to.equal(
        'Destination',
      );
    });

    it('hides trip destination when tripId is absent', () => {
      const wrapper = render({
        match: {
          ...baseMatch,
          params: { routeId: 'HSL:1001' }, // no tripId, no patternId
        },
      });
      expect(wrapper.find('.trip-destination')).to.have.lengthOf(0);
    });

    it('hides trip destination when tripId is present but no matching pattern', () => {
      const wrapper = render({
        match: {
          ...baseMatch,
          params: {
            routeId: 'HSL:1001',
            tripId: 'trip-123',
            patternId: 'NOMATCH',
          },
        },
      });
      // headsign will be null because pattern is not found
      expect(wrapper.find('.trip-destination')).to.have.lengthOf(0);
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
      const wrapper = render({
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
      expect(wrapper.find('.destination-headsign').text()).to.equal(
        'Central Station',
      );
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
      const wrapper = render({
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
      expect(wrapper.find('.destination-headsign').text()).to.equal('Terminal');
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
      const wrapper = render({
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
      expect(wrapper.find('.destination-headsign').text()).to.equal(
        'End Station',
      );
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
      const wrapper = render({
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
      expect(wrapper.find(AlertBanner)).to.have.lengthOf(1);
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
      const wrapper = render({
        route,
        match: {
          ...baseMatch,
          params: { routeId: 'HSL:1001', patternId: 'HSL:1001:0:01' }, // no tripId
        },
      });
      expect(wrapper.find(AlertBanner)).to.have.lengthOf(0);
    });

    it('hides AlertBanner when tripId is set but pattern has no alerts', () => {
      const wrapper = render({
        match: {
          ...baseMatch,
          params: {
            routeId: 'HSL:1001',
            tripId: 'trip-1',
            patternId: 'HSL:1001:0:01',
          },
        },
      });
      expect(wrapper.find(AlertBanner)).to.have.lengthOf(0);
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
                entities: [{ __typename: 'Stop' }], // not Route
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
      const wrapper = render({
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
      expect(wrapper.find(AlertBanner)).to.have.lengthOf(0);
    });

    it('hides AlertBanner when alerts have expired (effectiveEndDate in the past)', () => {
      const expiredTime = currentTime - 7200; // 2 hours ago
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
      const wrapper = render({
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
      expect(wrapper.find(AlertBanner)).to.have.lengthOf(0);
    });
  });

  describe('RouteControlPanel', () => {
    it('renders RouteControlPanel when type param equals PREFIX_DISRUPTION', () => {
      const wrapper = render({
        match: {
          ...baseMatch,
          params: { ...baseMatch.params, type: PREFIX_DISRUPTION },
        },
      });
      expect(wrapper.find(RouteControlPanel)).to.have.lengthOf(1);
    });

    it('does not render RouteControlPanel when type param is absent', () => {
      const wrapper = render({
        match: { ...baseMatch, params: { routeId: 'HSL:1001' } },
      });
      expect(wrapper.find(RouteControlPanel)).to.have.lengthOf(0);
    });

    it('does not render RouteControlPanel when type param is not PREFIX_DISRUPTION', () => {
      const wrapper = render({
        match: {
          ...baseMatch,
          params: { ...baseMatch.params, type: 'some-other-prefix' },
        },
      });
      expect(wrapper.find(RouteControlPanel)).to.have.lengthOf(0);
    });
  });

  describe('Local call agency styling', () => {
    it('applies call-local styling when route is a local call agency', () => {
      const callAgencyRoute = {
        ...baseRoute,
        type: 715, // ExtendedRouteTypes.CallAgency
        agency: { ...baseRoute.agency, gtfsId: 'FOO:FOO' },
      };
      configStub.returns({
        ...baseConfig,
        flex: { internalAgencies: ['FOO:FOO'] },
      });
      const wrapper = render({ route: callAgencyRoute });
      expect(wrapper.find('.call-local')).to.have.lengthOf.at.least(1);
    });

    it('does not apply call-local styling for a regular route', () => {
      const wrapper = render();
      expect(wrapper.find('.call-local')).to.have.lengthOf(0);
    });
  });

  describe('Route color', () => {
    it('applies route color as inline style on the heading when color is set', () => {
      const wrapper = render({ route: { ...baseRoute, color: 'FF0000' } });
      const heading = wrapper.find('h1.route-short-name');
      expect(heading.prop('style')).to.deep.equal({ color: '#FF0000' });
    });

    it('sets null color style when route has no color', () => {
      const wrapper = render({ route: { ...baseRoute, color: null } });
      const heading = wrapper.find('h1.route-short-name');
      expect(heading.prop('style')).to.deep.equal({ color: null });
    });
  });
});
