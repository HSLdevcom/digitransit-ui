import React from 'react';
import { renderWithProviders } from '../helpers/mock-providers';
import { createTestConfig } from '../helpers/mock-context';
import { Component as TerminalPageContent } from '../../../app/component/stop/TerminalPageContentContainer';

vi.mock('../../../app/component/DepartureListContainer', () => ({
  default: () => <div data-testid="departure-list" />,
}));

const markersConfig = createTestConfig({ showStopStatusMarkers: true });

const baseProps = {
  currentTime: 1000,
  relay: { refetch: () => {}, environment: {} },
};

const renderTerminal = stationProps =>
  renderWithProviders(
    <TerminalPageContent
      {...baseProps}
      station={{
        routes: [],
        vehicleMode: 'BUS',
        alerts: [],
        futureStoptimes: [],
        ...stationProps,
      }}
    />,
    { config: markersConfig, currentTime: 1000 },
  );

describe('<TerminalPageContentContainer />', () => {
  it('renders the no-departures banner when stoptimes is empty', () => {
    const { container, queryByTestId } = renderTerminal({});
    expect(
      container.querySelector('.stop-no-departures-container'),
    ).not.toBeNull();
    expect(queryByTestId('departure-list')).toBeNull();
  });

  it('shows the out-of-service status when futureStoptimes is empty', () => {
    const { container } = renderTerminal({ futureStoptimes: [] });
    expect(container.textContent).toContain('Stop out of service');
  });

  it('shows the no-service-today status when futureStoptimes has entries', () => {
    const { container } = renderTerminal({
      futureStoptimes: [{ serviceDay: 1 }],
    });
    expect(container.textContent).toContain('No departures today');
  });

  it('shows the departure list when stoptimes are present', () => {
    const stoptimes = [
      { serviceDay: 0, realtimeState: 'SCHEDULED', trip: { pattern: {} } },
    ];
    const { queryByTestId } = renderTerminal({ stoptimes });
    expect(queryByTestId('departure-list')).not.toBeNull();
  });
});
