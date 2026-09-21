import { expect } from 'chai';
import { describe, it, afterEach } from 'mocha';
import React from 'react';
import sinon from 'sinon';
// react-relay's CJS build (unlike this repo's own Babel-ESM output) has no
// `__esModule` marker, so `import * as X` gets a one-off *copied* namespace
// object from Babel's interop helper instead of the live module.exports —
// stubbing that copy wouldn't be visible to the component modules' own
// (separately copied) references. A default import bypasses that: Babel's
// `_interopRequireDefault` wraps a non-ESM module as `{ default: rawModule }`
// without copying properties, so `relayHooks` below is the exact same live
// object every importer of 'react-relay/hooks' reads its named exports from.
import relayHooks from 'react-relay/hooks';
import { renderWithProviders } from '../../helpers/mock-providers';
import { mockMatch } from '../../helpers/mock-router';
import TrafficNow from '../../../../app/component/trafficnow/TrafficNow';
import AlertsQuery from '../../../../app/component/trafficnow/queries/AlertsQuery';
import CanceledTripsOverviewQuery from '../../../../app/component/trafficnow/queries/CanceledTripsOverviewQuery';
import CanceledTripsForModeQuery from '../../../../app/component/trafficnow/queries/CanceledTripsForModeQuery';
import * as withBreakpoint from '../../../../utils/client/withBreakpoint';

const baseConfig = {
  CONFIG: 'default',
  colors: { primary: '#007ac9' },
  feedIds: ['MATKA'],
  URL: { OTP: 'https://example.com/otp/' },
};

// Minimal Relay query result fixtures. Only what each consuming component
// (Disruptions / CanceledTripsContainer / DisruptionDetailsContainer)
// actually destructures/reads is included, kept empty by default so
// "no disruptions/cancelations" branches render deterministically.
const EMPTY_ALERTS_FIXTURE = { alerts: [] };
const EMPTY_CANCELATIONS_OVERVIEW_FIXTURE = {};
const EMPTY_CANCELED_TRIPS_FOR_MODE_FIXTURE = {
  canceledTripsSummary: { routes: [] },
};

const ALERT_ONE = {
  id: 'alert-1',
  alertSeverityLevel: 'WARNING',
  alertEffect: 'REDUCED_SERVICE',
  alertHeaderText: 'Alert one header',
  alertDescriptionText: 'Alert one description',
  effectiveStartDate: 1000,
  effectiveEndDate: 2000,
  alertUrl: null,
  entities: undefined,
};

/**
 * Stubs useLazyLoadQuery (react-relay/hooks) so every child component that
 * calls it (Disruptions, CanceledTripsContainer, DisruptionDetailsContainer)
 * renders using canned fixture data instead of requiring a real Relay
 * environment/network response. `alertsFixture` is swappable per test so the
 * alertId (details) view can be exercised with a matching alert.
 */
function stubRelayQueries(
  sandbox,
  { alertsFixture = EMPTY_ALERTS_FIXTURE } = {},
) {
  sandbox.stub(relayHooks, 'useLazyLoadQuery').callsFake(query => {
    if (query === AlertsQuery) {
      return alertsFixture;
    }
    if (query === CanceledTripsOverviewQuery) {
      return EMPTY_CANCELATIONS_OVERVIEW_FIXTURE;
    }
    if (query === CanceledTripsForModeQuery) {
      return EMPTY_CANCELED_TRIPS_FOR_MODE_FIXTURE;
    }
    return {};
  });
}

describe('<TrafficNow />', () => {
  let sandbox;

  afterEach(() => sandbox.restore());

  const renderTrafficNow = ({ breakpoint, mode, alertId, alertsFixture }) => {
    sandbox = sinon.createSandbox();
    sandbox.stub(withBreakpoint, 'useBreakpoint').returns(breakpoint);
    stubRelayQueries(sandbox, { alertsFixture });
    // jsdom doesn't implement window.scrollTo; TrafficNow calls it (via
    // utils/client/scroll.js) on mount and whenever mode/alertId change.
    sandbox.stub(window, 'scrollTo');
    return renderWithProviders(
      <TrafficNow dateTime="2024-01-01T00:00:00.000Z" />,
      {
        config: baseConfig,
        match: { ...mockMatch, params: { mode, alertId } },
      },
    );
  };

  // Each `it` below renders TrafficNow once for its scenario (rather than
  // once per assertion): the repo's global `afterEach` unmounts the DOM via
  // RTL's `cleanup()` after every test, so a single shared render can't be
  // reused across multiple `it`s — consolidating instead means one render
  // per distinct prop combination, with all of that render's expectations
  // grouped into that one test.
  describe('Desktop layout — no mode param', () => {
    it('renders the header, desktop Filters panel, and Disruptions (empty state); no mobile classes/containers', () => {
      const { container } = renderTrafficNow({ breakpoint: 'large' });

      expect(container.querySelector('.traffic-now__header')).to.not.equal(
        null,
      );

      const filtersContainer = container.querySelector(
        '.traffic-now__filters-container',
      );
      expect(filtersContainer).to.not.equal(null);
      // Filters renders a "validity period" filter group as one of its parts.
      expect(
        filtersContainer.querySelector('.separator.horizontal'),
      ).to.not.equal(null);

      expect(container.querySelector('.disruptions')).to.not.equal(null);
      expect(container.querySelector('.disruptions-empty')).to.not.equal(null);

      expect(
        container.querySelector('.traffic-now__filters-button-container'),
      ).to.equal(null);
      expect(container.querySelector('.traffic-now__body--mobile')).to.equal(
        null,
      );
    });
  });

  describe('Mobile layout — no mode param', () => {
    it('renders the header, mobile filters button, and Disruptions (empty state); applies the mobile body class', () => {
      const { container } = renderTrafficNow({ breakpoint: 'small' });

      expect(container.querySelector('.traffic-now__header')).to.not.equal(
        null,
      );

      expect(
        container.querySelector('.traffic-now__filters-button-container'),
      ).to.not.equal(null);
      expect(
        container.querySelector('.traffic-now__filters-container'),
      ).to.equal(null);

      expect(container.querySelector('.disruptions')).to.not.equal(null);

      expect(
        container.querySelector('.traffic-now__body--mobile'),
      ).to.not.equal(null);
    });
  });

  describe('Desktop layout — with mode param', () => {
    it('shows the header and renders CanceledTripsContainer in non-mobile layout; hides Disruptions', () => {
      const { container } = renderTrafficNow({
        breakpoint: 'large',
        mode: 'CANCELED',
      });

      expect(container.querySelector('.traffic-now__header')).to.not.equal(
        null,
      );

      expect(container.querySelector('.canceled-trips__body')).to.not.equal(
        null,
      );
      // Cards (rather than bare fragments) are only used in the non-mobile layout.
      expect(container.querySelector('.canceled-trips__footer')).to.not.equal(
        null,
      );
      expect(container.querySelector('.traffic-now__body--mobile')).to.equal(
        null,
      );

      expect(container.querySelector('.disruptions')).to.equal(null);
    });
  });

  describe('Mobile layout — with mode param (isMobileCanceledTripsView)', () => {
    it('hides the header/separator and renders CanceledTripsContainer with the mobile body class', () => {
      const { container } = renderTrafficNow({
        breakpoint: 'medium',
        mode: 'CANCELED',
      });

      expect(container.querySelector('.traffic-now__header')).to.equal(null);
      expect(container.querySelector('.separator.horizontal')).to.equal(null);

      expect(container.querySelector('.canceled-trips__body')).to.not.equal(
        null,
      );
      expect(
        container.querySelector('.traffic-now__body--mobile'),
      ).to.not.equal(null);
    });
  });

  describe('Desktop layout — with alertId param (details view)', () => {
    it('shows the header and renders DisruptionDetailsContainer in non-mobile layout with alert content; hides Disruptions/CanceledTripsContainer', () => {
      const { container } = renderTrafficNow({
        breakpoint: 'large',
        alertId: 'alert-1',
        alertsFixture: { alerts: [ALERT_ONE] },
      });

      expect(container.querySelector('.traffic-now__header')).to.not.equal(
        null,
      );

      expect(
        container.querySelector('.detail-view__cta-container'),
      ).to.not.equal(null);
      expect(container.textContent).to.include('Alert one header');
      expect(container.textContent).to.include('Alert one description');
      expect(
        container.querySelector('.detail-view__cta-container--mobile'),
      ).to.equal(null);
      expect(
        container.querySelector('.disruption-details__container'),
      ).to.not.equal(null);

      expect(container.querySelector('.disruptions')).to.equal(null);
      expect(container.querySelector('.canceled-trips__body')).to.equal(null);
    });
  });

  describe('Mobile layout — with alertId param (details view)', () => {
    it('hides the header and renders DisruptionDetailsContainer in mobile layout with the mobile body class', () => {
      const { container } = renderTrafficNow({
        breakpoint: 'medium',
        alertId: 'alert-1',
        alertsFixture: { alerts: [ALERT_ONE] },
      });

      expect(container.querySelector('.traffic-now__header')).to.equal(null);

      expect(container.textContent).to.include('Alert one header');
      expect(
        container.querySelector('.detail-view__cta-container--mobile'),
      ).to.not.equal(null);
      expect(
        container.querySelector('.disruption-details--mobile'),
      ).to.not.equal(null);

      expect(
        container.querySelector('.traffic-now__body--mobile'),
      ).to.not.equal(null);
    });
  });
});
