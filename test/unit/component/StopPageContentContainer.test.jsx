import React from 'react';
import { renderWithProviders } from '../helpers/mock-providers';
import { createTestConfig } from '../helpers/mock-context';
import { mockMatch } from '../helpers/mock-router';
import translations from '../../../app/translations/en';
import { Component as StopPageContentContainer } from '../../../app/component/stop/StopPageContentContainer';

// The departure list is a relay container and isn't under test
vi.mock('../../../app/component/DepartureListContainer', () => ({
  default: () => <div data-testid="departure-list" />,
}));

const messages = translations.en;
const statusConfig = createTestConfig({ showStopStatusMarkers: true });

const renderWithStop = stopProps =>
  renderWithProviders(
    <StopPageContentContainer
      relay={{ refetch: () => {}, environment: {} }}
      stop={{ routes: [], alerts: [], futureStoptimes: [], ...stopProps }}
    />,
    {
      config: statusConfig,
      match: { ...mockMatch, params: { stopId: 'HSL:1234' } },
      currentTime: 1000,
    },
  );

describe('<StopPageContentContainer />', () => {
  it('shows "out of service" when there are no departures or future service', () => {
    const { container } = renderWithStop({ futureStoptimes: [] });
    expect(container.textContent).toBe(messages['stop-out-of-service']);
  });

  it('shows "no departures today" when future service exists', () => {
    const { container } = renderWithStop({
      futureStoptimes: [{ serviceDay: 1 }],
    });
    expect(container.textContent).toBe(messages['stop-no-service-today']);
  });

  it('shows the departure list when stoptimes are present', () => {
    const { queryByTestId } = renderWithStop({
      stoptimes: [
        { serviceDay: 0, realtimeState: 'SCHEDULED', trip: { pattern: {} } },
      ],
    });
    expect(queryByTestId('departure-list')).not.toBeNull();
  });

  it("should show a 'no departures' indicator", () => {
    const props = {
      params: {
        stopId: '1234',
      },
      relay: {
        refetch: () => {},
        environment: {},
      },
      stop: {},
      match: mockMatch,
    };
    const { container } = renderWithProviders(
      <StopPageContentContainer {...props} />,
      { currentTime: 0 },
    );
    expect(
      container.querySelector('.stop-no-departures-container'),
    ).not.toBeNull();
  });
});
