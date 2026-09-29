import React from 'react';
import { fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../helpers/mock-providers';
import { createTestConfig } from '../../helpers/mock-context';
import { FilterContextProvider } from '../../../../app/component/trafficnow/filters/FiltersContext';
import DisruptionCard from '../../../../app/component/trafficnow/DisruptionCard';
import * as trafficNowUtils from '../../../../app/component/trafficnow/utils';
import { AlertSeverityLevelType } from '../../../../utils/shared/constants';

const baseConfig = createTestConfig({
  colors: { primary: '#007ac9' },
});

// NOW_MS = 1 000 000 ms.  effectiveStartDate = 500 s (past), effectiveEndDate = 2 000 s (future).
const NOW_MS = 1_000_000;

const makeAlert = (overrides = {}) => ({
  id: 'alert-1',
  alertSeverityLevel: AlertSeverityLevelType.Warning,
  alertEffect: 'DELAY',
  alertHeaderText: 'Service disruption',
  alertDescriptionText: 'Trains delayed by 15 minutes.',
  entities: [
    {
      __typename: 'Route',
      gtfsId: 'HSL:1',
      id: 'HSL:1',
      mode: 'BUS',
      shortName: '1',
    },
  ],
  effectiveStartDate: 500, // seconds
  effectiveEndDate: 2000, // seconds
  ...overrides,
});

describe('<DisruptionCard />', () => {
  beforeEach(() => {
    vi.spyOn(Date, 'now').mockReturnValue(NOW_MS);
  });

  // RouteBadges needs a real FilterContextProvider ancestor: useFilterContext
  // throws without one and there's no default context value.
  const renderCard = props => {
    const { container } = renderWithProviders(
      <FilterContextProvider>
        <DisruptionCard alert={makeAlert()} {...props} />
      </FilterContextProvider>,
      { config: baseConfig },
    );
    return container;
  };

  describe('RouteBadges', () => {
    it('renders RouteBadges (mounts groupEntitiesByMode) when entities are present', () => {
      // sinon can't spy on this repo's own ESM exports (calls aren't
      // observed on the live binding real importers read from); vi.spyOn can
      // (auto-restored via the `restoreMocks: true` Vitest config option).
      const groupEntitiesByModeSpy = vi.spyOn(
        trafficNowUtils,
        'groupEntitiesByMode',
      );
      const container = renderCard();
      expect(groupEntitiesByModeSpy.mock.calls.length).toBeGreaterThan(0);
      expect(container.querySelector('.badges__group')).not.toBeNull();
    });

    it('still renders RouteBadges (mounts groupEntitiesByMode with []) when entities is an empty array', () => {
      const groupEntitiesByModeSpy = vi.spyOn(
        trafficNowUtils,
        'groupEntitiesByMode',
      );
      renderCard({ alert: makeAlert({ entities: [] }) });
      // [].every(...) is vacuously true, so RouteBadges itself renders
      // nothing here -- but it must still have been mounted/invoked (with an
      // empty array reaching groupEntitiesByMode), unlike the null case below.
      expect(
        groupEntitiesByModeSpy.mock.calls.map(call => call[0]),
      ).toContainEqual([]);
    });
  });

  describe('isMobile layout', () => {
    it('renders separator and DisruptionStatus in the header when isMobile=false', () => {
      const container = renderCard({ isMobile: false });
      expect(container.querySelector('.separator.vertical')).not.toBeNull();
      expect(
        container.querySelector('header .disruption-status'),
      ).not.toBeNull();
    });

    it('hides the header separator and moves DisruptionStatus below route badges when isMobile=true', () => {
      const container = renderCard({ isMobile: true });
      expect(container.querySelector('.separator.vertical')).toBeNull();
      expect(container.querySelector('header .disruption-status')).toBeNull();
      expect(container.querySelector('.disruption-status')).not.toBeNull();
    });

    it('passes showDates=false to DisruptionStatus for INFO severity', () => {
      const container = renderCard({
        alert: makeAlert({ alertSeverityLevel: AlertSeverityLevelType.Info }),
      });
      // showDates=false means DisruptionStatus never renders its date-range Text.
      expect(
        container.querySelector('.disruption-status [class*="routes-s"]'),
      ).toBeNull();
    });

    it('passes showDates=true to DisruptionStatus for WARNING severity', () => {
      const container = renderCard({
        alert: makeAlert({
          alertSeverityLevel: AlertSeverityLevelType.Warning,
        }),
      });
      expect(
        container.querySelector('.disruption-status [class*="routes-s"]'),
      ).not.toBeNull();
    });
  });

  describe('onClick delegation', () => {
    it('calls onClick with the alert id when the card is clicked', () => {
      const onClickSpy = vi.fn();
      const container = renderCard({
        alert: makeAlert({ id: 'alert-42' }),
        onClick: onClickSpy,
      });
      fireEvent.click(container.querySelector('.disruption-card'));
      expect(onClickSpy.mock.calls[0][0]).toBe('alert-42');
    });
  });

  describe('Null entities', () => {
    it('does not render RouteBadges when entities is null', () => {
      const groupEntitiesByModeSpy = vi.spyOn(
        trafficNowUtils,
        'groupEntitiesByMode',
      );
      const container = renderCard({
        alert: makeAlert({ entities: null }),
      });
      // With entities=null, DisruptionCard's `{entities && <RouteBadges />}`
      // guard skips mounting RouteBadges entirely.
      expect(groupEntitiesByModeSpy.mock.calls.length).toBe(0);
      expect(container.querySelector('.badges')).toBeNull();
    });
  });
});
