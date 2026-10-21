import React from 'react';
import { renderWithProviders } from '../helpers/mock-providers';
import { createTestConfig } from '../helpers/mock-context';
import { mockMatch } from '../helpers/mock-router';
import { Component as StopPageContentContainer } from '../../../app/component/stop/StopPageContentContainer';

vi.mock('../../../app/component/DepartureListContainer', () => ({
  default: () => <div data-testid="departure-list" />,
}));

const markersConfig = createTestConfig({ showStopStatusMarkers: true });

const baseProps = {
  relay: { refetch: () => {}, environment: {} },
  match: { ...mockMatch, params: { stopId: 'HSL:1234' } },
};

const renderStop = (stopProps, config = markersConfig) =>
  renderWithProviders(
    <StopPageContentContainer
      {...baseProps}
      stop={{ routes: [], ...stopProps }}
    />,
    { config, match: baseProps.match, currentTime: 0 },
  );

describe('<StopPageContentContainer />', () => {
  it("should show a 'no departures' indicator when stoptimes is empty", () => {
    const { container, queryByTestId } = renderStop({}, createTestConfig());
    expect(
      container.querySelector('.stop-no-departures-container'),
    ).not.toBeNull();
    expect(container.textContent).toContain('No departures');
    expect(queryByTestId('departure-list')).toBeNull();
  });

  it('shows the out-of-service status when futureStoptimes is empty', () => {
    const { container } = renderStop({ futureStoptimes: [] });
    expect(container.textContent).toContain('Stop out of service');
  });

  it('shows the no-service-today status when futureStoptimes has entries', () => {
    const { container } = renderStop({ futureStoptimes: [{ serviceDay: 1 }] });
    expect(container.textContent).toContain('No departures today');
  });

  it('shows the departure list when stoptimes are present', () => {
    const stoptimes = [
      { serviceDay: 0, realtimeState: 'SCHEDULED', trip: { pattern: {} } },
    ];
    const { queryByTestId } = renderStop({ stoptimes });
    expect(queryByTestId('departure-list')).not.toBeNull();
  });
});
