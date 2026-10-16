import React from 'react';
import { renderWithProviders } from '../helpers/mock-providers';
import { createTestConfig } from '../helpers/mock-context';
import translations from '../../../app/translations/en';
import { Component as TerminalPageContent } from '../../../app/component/stop/TerminalPageContentContainer';

// The departure list is a relay container and isn't under test
vi.mock('../../../app/component/DepartureListContainer', () => ({
  default: () => <div data-testid="departure-list" />,
}));

const messages = translations.en;
const config = createTestConfig({ showStopStatusMarkers: true });

const relay = { refetch: () => {}, environment: {} };

const render = stationProps =>
  renderWithProviders(
    <TerminalPageContent
      relay={relay}
      station={{
        routes: [],
        vehicleMode: 'BUS',
        alerts: [],
        futureStoptimes: [],
        ...stationProps,
      }}
    />,
    { config, currentTime: 1000 },
  );

describe('<TerminalPageContentContainer />', () => {
  it('shows the no-departures panel when stoptimes is empty', () => {
    const { container, queryByTestId } = render({});
    expect(
      container.querySelector('.stop-no-departures-container'),
    ).not.toBeNull();
    expect(queryByTestId('departure-list')).toBeNull();
  });

  it('shows "out of service" when there are no future stoptimes', () => {
    const { container } = render({ futureStoptimes: [] });
    expect(container.textContent).toBe(messages['stop-out-of-service']);
  });

  it('shows "no departures today" when future stoptimes exist', () => {
    const { container } = render({ futureStoptimes: [{ serviceDay: 1 }] });
    expect(container.textContent).toBe(messages['stop-no-service-today']);
  });

  it('shows the departure list when stoptimes are present', () => {
    const { queryByTestId } = render({
      stoptimes: [
        { serviceDay: 0, realtimeState: 'SCHEDULED', trip: { pattern: {} } },
      ],
    });
    expect(queryByTestId('departure-list')).not.toBeNull();
  });
});
