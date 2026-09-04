import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import React from 'react';
import PropTypes from 'prop-types';
import sinon from 'sinon';
import { render, fireEvent } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import * as found from 'found';
import translations from '../../../../app/translations/en';
import { ConfigProvider } from '../../../../app/configurations/ConfigContext';
import { Component as CanceledTripCard } from '../../../../app/component/trafficnow/CanceledTripCard';
import * as FiltersContext from '../../../../app/component/trafficnow/filters/FiltersContext';
import { mockContext } from '../../helpers/mock-context';

// RouteBadgeGroup is rendered via its `connectToStores`-wrapped default
// export, which reads `FavouriteStore` off the legacy Fluxible context.
// Reuse the shared mockContext so the real component tree renders.
class LegacyFluxibleContext extends React.Component {
  getChildContext() {
    return {
      getStore: name => ({
        ...mockContext.getStore(name),
        getFavourites: () => [],
      }),
    };
  }

  render() {
    return this.props.children;
  }
}
LegacyFluxibleContext.childContextTypes = { getStore: PropTypes.func };
LegacyFluxibleContext.propTypes = { children: PropTypes.node.isRequired };

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
  let router;

  beforeEach(() => {
    router = { push: sinon.spy() };
    sinon.stub(found, 'useRouter').returns({ router });
    sinon
      .stub(FiltersContext, 'useFilterContext')
      .returns({ selectedFilters: {} });
  });

  afterEach(() => {
    found.useRouter.restore();
    FiltersContext.useFilterContext.restore();
  });

  const renderCanceledTripCard = (props, config = baseConfig) => {
    const { container } = render(
      <IntlProvider locale="en" messages={translations.en}>
        <ConfigProvider value={config}>
          <LegacyFluxibleContext>
            <CanceledTripCard {...baseProps} {...props} />
          </LegacyFluxibleContext>
        </ConfigProvider>
      </IntlProvider>,
    );
    return container;
  };

  const routeBadgeNames = container =>
    Array.from(
      container.querySelectorAll(
        '.badges__headsign-group > .badge-container:not(.more-routes) a, .badges__headsign-group > .badges__headsign-group--route > .badge-container:not(.more-routes) a',
      ),
    ).map(a => a.textContent.trim());

  const routeBadgeHrefs = container =>
    Array.from(
      container.querySelectorAll(
        '.badges__headsign-group > .badge-container:not(.more-routes) a, .badges__headsign-group > .badges__headsign-group--route > .badge-container:not(.more-routes) a',
      ),
    ).map(a => a.getAttribute('href'));

  describe('RouteBadgeGroup props', () => {
    it('maps canceled route summaries to route badges', () => {
      const container = renderCanceledTripCard();

      expect(routeBadgeNames(container)).to.deep.equal(['21B']);
      expect(routeBadgeHrefs(container)).to.deep.equal(['/linjat/HSL%3A21B']);
    });

    it('limits the amount of route badges', () => {
      const container = renderCanceledTripCard(
        { routes: makeRoutes(6) },
        { ...baseConfig, trafficNowMaxRoutesPerCard: 3 },
      );

      expect(routeBadgeNames(container)).to.deep.equal(['20', '21', '22']);
    });

    it('renders the count of hidden routes when there are more than allowed', () => {
      const container = renderCanceledTripCard(
        { routes: makeRoutes(6) },
        { ...baseConfig, trafficNowMaxRoutesPerCard: 3 },
      );
      const moreRoutes = container.querySelector('.more-routes');

      expect(moreRoutes).to.not.equal(null);
      expect(moreRoutes.textContent.trim()).to.equal('+3');
    });

    it('does not render the three-dots icon when all routes are visible', () => {
      const container = renderCanceledTripCard({ routes: makeRoutes(5) });

      expect(container.querySelector('.more-routes')).to.equal(null);
    });

    it('renders the departure time when there is only a single route', () => {
      const container = renderCanceledTripCard();
      const departureTimes = Array.from(
        container.querySelectorAll(
          '.badges__headsign-group--route .badges__departure-time .routes-s-narrow',
        ),
      ).map(node => node.textContent.trim());

      expect(departureTimes).to.deep.equal(['08:00']);
    });

    it('renders cancellations from all patterns when there is only a single route', () => {
      const container = renderCanceledTripCard({
        routes: [
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
        ],
      });
      const departureTimes = Array.from(
        container.querySelectorAll(
          '.badges__headsign-group--route .badges__departure-time .routes-s-narrow',
        ),
      ).map(node => node.textContent.trim());

      expect(departureTimes).to.deep.equal(['08:00', '08:05']);
    });

    it('limits inline departures per pattern', () => {
      const container = renderCanceledTripCard({
        routes: [
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
        ],
      });

      expect(
        container.querySelectorAll(
          '.badges__departure-time:not(.badges__departure-time--show-more)',
        ),
      ).to.have.lengthOf(10);
    });

    it('renders inline hidden departure count per pattern', () => {
      const container = renderCanceledTripCard({
        routes: [
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
        ],
      });
      const hiddenCounts = Array.from(
        container.querySelectorAll('.badges__departure-time--show-more'),
      ).map(node => node.textContent.trim());

      expect(hiddenCounts).to.deep.equal(['+2', '+3']);
    });
  });

  describe('isMobile layout', () => {
    it('renders separator and DisruptionStatus in the header when isMobile=false', () => {
      const container = renderCanceledTripCard({ isMobile: false });

      expect(
        container.querySelectorAll('.separator.vertical'),
      ).to.have.lengthOf(1);
      expect(container.querySelector('header .disruption-status')).to.not.equal(
        null,
      );
    });

    it('hides the header separator and moves DisruptionStatus below badges when isMobile=true', () => {
      const container = renderCanceledTripCard({ isMobile: true });

      expect(
        container.querySelectorAll('.separator.vertical'),
      ).to.have.lengthOf(0);
      expect(container.querySelector('header .disruption-status')).to.equal(
        null,
      );
      expect(container.querySelector('.disruption-status')).to.not.equal(null);
    });
  });

  describe('Navigation', () => {
    it('navigates to the canceled trips detail view for the mode when the card is clicked', () => {
      const container = renderCanceledTripCard();

      fireEvent.click(container.querySelector('.card'));

      expect(router.push.calledWith('/liikenne/peruutukset/bus')).to.equal(
        true,
      );
    });
  });
});
