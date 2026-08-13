import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import { shallow } from 'enzyme';
import sinon from 'sinon';
import {
  shallowWithIntl,
  createShallowHookSandbox,
} from '../../helpers/mock-intl-enzyme';
import { Component as CanceledTripCard } from '../../../../app/component/trafficnow/CanceledTripCard';
import Card from '../../../../app/component/Card';
import DisruptionStatus from '../../../../app/component/trafficnow/components/DisruptionStatus';
import RouteBadgeGroup from '../../../../app/component/trafficnow/components/RouteBadgeGroup';
import CanceledDepartures from '../../../../app/component/trafficnow/components/CanceledDepartures';
import * as FiltersContext from '../../../../app/component/trafficnow/filters/FiltersContext';
import EntityBadge from '../../../../app/component/trafficnow/components/EntityBadge';

const makeRouteSummary = ({
  shortName = '21B',
  gtfsId = 'HSL:21B',
  id = 'route-21B',
  cancellationCount = 2,
  patterns = [
    {
      cancellationCount: 2,
      pattern: {
        code: 'pattern-21B',
        headsign: 'Kamppi',
        stops: [{ name: 'Eira' }, { name: 'Kamppi' }],
        canceledTrips: [
          {
            serviceDate: '2026-01-01',
            trip: {
              gtfsId: 'trip-21B-1',
              stoptimes: [{ scheduledDeparture: 28800 }],
            },
          },
        ],
      },
    },
  ],
} = {}) => ({
  cancellationCount,
  route: {
    shortName,
    gtfsId,
    id,
    mode: 'BUS',
  },
  patterns,
});

const makeRoutes = amount =>
  new Array(amount).fill(null).map((_, i) =>
    makeRouteSummary({
      shortName: `${20 + i}`,
      gtfsId: `HSL:${20 + i}`,
      id: `route-${20 + i}`,
    }),
  );

const makeCanceledTrips = ({
  amount,
  serviceDate = '2026-01-01',
  startTime = 8 * 60 * 60,
  gtfsIdPrefix = 'trip-21B',
}) =>
  new Array(amount).fill(null).map((_, i) => ({
    serviceDate,
    trip: {
      gtfsId: `${gtfsIdPrefix}-${i}`,
      stoptimes: [{ scheduledDeparture: startTime + i * 60 }],
    },
  }));

const baseProps = {
  mode: 'bus',
  routes: [makeRouteSummary()],
};

const baseConfig = {
  CONFIG: 'default',
  colors: { primary: '#007ac9' },
  trafficNowMaxRoutesPerCard: 5,
};

describe('<CanceledTripCard />', () => {
  let stubs;
  let sandbox;
  let filterContextStub;

  beforeEach(() => {
    ({ sandbox, stubs } = createShallowHookSandbox({ config: baseConfig }));
    filterContextStub = sandbox.stub(FiltersContext, 'useFilterContext');
    filterContextStub.returns({
      selectedFilters: {},
    });
  });
  afterEach(() => sandbox.restore());

  describe('RouteBadgeGroup props', () => {
    it('maps canceled route summaries to route badges', () => {
      const wrapper = shallowWithIntl(<CanceledTripCard {...baseProps} />);
      const badgeGroup = wrapper.find(RouteBadgeGroup);

      expect(badgeGroup).to.have.lengthOf(1);
      expect(badgeGroup.prop('mode')).to.equal('bus');
      expect(badgeGroup.prop('stopPropagation')).to.equal(true);
      expect(badgeGroup.prop('routes')).to.deep.equal([
        {
          name: '21B',
          gtfsId: 'HSL:21B',
          id: 'route-21B',
          url: '/linjat/HSL%3A21B',
        },
      ]);
    });

    it('limits the amount of route badges', () => {
      stubs.useConfigContext.returns({
        ...baseConfig,
        trafficNowMaxRoutesPerCard: 3,
      });
      const wrapper = shallowWithIntl(
        <CanceledTripCard {...baseProps} routes={makeRoutes(6)} />,
      );
      const routes = wrapper.find(RouteBadgeGroup).prop('routes');

      expect(routes).to.have.lengthOf(3);
      expect(routes.map(route => route.name)).to.deep.equal(['20', '21', '22']);
    });

    it('renders the count of hidden routes when there are more than allowed', () => {
      stubs.useConfigContext.returns({
        ...baseConfig,
        trafficNowMaxRoutesPerCard: 3,
      });
      const wrapper = shallowWithIntl(
        <CanceledTripCard {...baseProps} routes={makeRoutes(6)} />,
      );
      const renderSuffix = wrapper.find(RouteBadgeGroup).prop('renderSuffix');
      const rendered = shallow(<div>{renderSuffix}</div>);
      const moreRoutes = rendered.find(EntityBadge);

      expect(moreRoutes).to.have.lengthOf(1);
      expect(moreRoutes.prop('className')).to.equal('more-routes');
      expect(moreRoutes.prop('entity').name).to.equal('+3');
    });

    it('does not render the three-dots icon when all routes are visible', () => {
      const wrapper = shallowWithIntl(
        <CanceledTripCard {...baseProps} routes={makeRoutes(5)} />,
      );

      expect(wrapper.find(RouteBadgeGroup).prop('renderSuffix')).to.equal(null);
    });

    it('renders the departure time when there is only a single route', () => {
      const wrapper = shallowWithIntl(<CanceledTripCard {...baseProps} />);
      const badgeGroup = wrapper.find(RouteBadgeGroup);
      const [route] = badgeGroup.prop('routes');
      const renderedSuffix = shallow(
        <div>{badgeGroup.prop('renderRouteSuffix')(route)}</div>,
      );

      expect(
        renderedSuffix
          .find(CanceledDepartures)
          .dive()
          .find('.routes-m-narrow')
          .text(),
      ).to.equal(' 08:00 ');
    });

    it('renders cancellations from all patterns when there is only a single route', () => {
      const wrapper = shallowWithIntl(
        <CanceledTripCard
          {...baseProps}
          routes={[
            makeRouteSummary({
              patterns: [
                {
                  cancellationCount: 1,
                  pattern: {
                    code: 'pattern-21B-1',
                    headsign: 'Kamppi',
                    stops: [{ name: 'Eira' }, { name: 'Kamppi' }],
                    canceledTrips: [
                      {
                        serviceDate: '2026-01-01',
                        trip: {
                          gtfsId: 'trip-21B-1',
                          stoptimes: [{ scheduledDeparture: 28800 }],
                        },
                      },
                    ],
                  },
                },
                {
                  cancellationCount: 1,
                  pattern: {
                    code: 'pattern-21B-2',
                    headsign: 'Rautatientori',
                    stops: [{ name: 'Eira' }, { name: 'Kamppi' }],
                    canceledTrips: [
                      {
                        serviceDate: '2026-01-01',
                        trip: {
                          gtfsId: 'trip-21B-2',
                          stoptimes: [{ scheduledDeparture: 29100 }],
                        },
                      },
                    ],
                  },
                },
              ],
            }),
          ]}
        />,
      );
      const badgeGroup = wrapper.find(RouteBadgeGroup);
      const [route] = badgeGroup.prop('routes');
      const renderedSuffix = shallow(
        <div>{badgeGroup.prop('renderRouteSuffix')(route)}</div>,
      );

      expect(
        renderedSuffix
          .find(CanceledDepartures)
          .dive()
          .find('.routes-m-narrow')
          .map(node => node.text()),
      ).to.deep.equal([' 08:00 ', ' 08:05 ']);
    });

    it('limits inline departures per pattern', () => {
      const wrapper = shallowWithIntl(
        <CanceledTripCard
          {...baseProps}
          routes={[
            makeRouteSummary({
              patterns: [
                {
                  cancellationCount: 6,
                  pattern: {
                    code: 'pattern-21B-1',
                    headsign: 'Kamppi',
                    stops: [{ name: 'Eira' }, { name: 'Kamppi' }],
                    canceledTrips: makeCanceledTrips({
                      amount: 6,
                      gtfsIdPrefix: 'trip-21B-1',
                    }),
                  },
                },
                {
                  cancellationCount: 6,
                  pattern: {
                    code: 'pattern-21B-2',
                    headsign: 'Rautatientori',
                    stops: [{ name: 'Eira' }, { name: 'Kamppi' }],
                    canceledTrips: makeCanceledTrips({
                      amount: 6,
                      startTime: 9 * 60 * 60,
                      gtfsIdPrefix: 'trip-21B-2',
                    }),
                  },
                },
              ],
            }),
          ]}
        />,
      );
      const badgeGroup = wrapper.find(RouteBadgeGroup);
      const [route] = badgeGroup.prop('routes');
      const renderedSuffix = shallow(
        <div>{badgeGroup.prop('renderRouteSuffix')(route)}</div>,
      );

      expect(
        renderedSuffix
          .find(CanceledDepartures)
          .dive()
          .find('.badges__departure-time')
          .not('.badges__departure-time--show-more'),
      ).to.have.lengthOf(10);
    });

    it('renders inline hidden departure count per pattern', () => {
      const wrapper = shallowWithIntl(
        <CanceledTripCard
          {...baseProps}
          routes={[
            makeRouteSummary({
              patterns: [
                {
                  cancellationCount: 7,
                  pattern: {
                    code: 'pattern-21B-1',
                    headsign: 'Kamppi',
                    stops: [{ name: 'Eira' }, { name: 'Kamppi' }],
                    canceledTrips: makeCanceledTrips({
                      amount: 7,
                      gtfsIdPrefix: 'trip-21B-1',
                    }),
                  },
                },
                {
                  cancellationCount: 8,
                  pattern: {
                    code: 'pattern-21B-2',
                    headsign: 'Rautatientori',
                    stops: [{ name: 'Eira' }, { name: 'Kamppi' }],
                    canceledTrips: makeCanceledTrips({
                      amount: 8,
                      startTime: 9 * 60 * 60,
                      gtfsIdPrefix: 'trip-21B-2',
                    }),
                  },
                },
              ],
            }),
          ]}
        />,
      );
      const badgeGroup = wrapper.find(RouteBadgeGroup);
      const [route] = badgeGroup.prop('routes');
      const renderedSuffix = shallow(
        <div>{badgeGroup.prop('renderRouteSuffix')(route)}</div>,
      );

      expect(
        renderedSuffix
          .find(CanceledDepartures)
          .dive()
          .find('.badges__departure-time--show-more')
          .map(node => node.text()),
      ).to.deep.equal(['+2', '+3']);
    });
  });

  describe('isMobile layout', () => {
    it('renders separator and DisruptionStatus in the header when isMobile=false', () => {
      const wrapper = shallowWithIntl(
        <CanceledTripCard {...baseProps} isMobile={false} />,
      );

      expect(wrapper.find('.separator.vertical')).to.have.lengthOf(1);
      expect(wrapper.find('header').find(DisruptionStatus)).to.have.lengthOf(1);
    });

    it('hides the header separator and moves DisruptionStatus below badges when isMobile=true', () => {
      const wrapper = shallowWithIntl(
        <CanceledTripCard {...baseProps} isMobile />,
      );

      expect(wrapper.find('.separator.vertical')).to.have.lengthOf(0);
      expect(wrapper.find('header').find(DisruptionStatus)).to.have.lengthOf(0);
      expect(wrapper.find(DisruptionStatus)).to.have.lengthOf(1);
    });
  });

  describe('Navigation', () => {
    it('navigates to the canceled trips detail view for the mode when the card is clicked', () => {
      const router = { push: sinon.spy() };
      const wrapper = shallowWithIntl(<CanceledTripCard {...baseProps} />, {
        router,
      });
      const event = {
        preventDefault: () => {},
        stopPropagation: () => {},
      };

      wrapper.find(Card).prop('onClick')(event);

      expect(router.push.calledWith('/liikenne/peruutukset/bus')).to.equal(
        true,
      );
    });
  });
});
