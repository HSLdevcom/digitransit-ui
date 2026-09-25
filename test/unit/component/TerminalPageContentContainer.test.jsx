import React from 'react';
import { renderWithProviders } from '../helpers/mock-providers';
import { Component as TerminalPageContent } from '../../../app/component/stop/TerminalPageContentContainer';

const baseConfig = {
  CONFIG: 'default',
  colors: { primary: '#007ac9', bus: '#007ac9', tram: '#00985f' },
  showStopStatusMarkers: false,
  useExtendedRouteTypes: false,
  externalFerryByStopCode: false,
};

const station = {
  routes: [],
  vehicleMode: 'BUS',
  alerts: [],
  futureStoptimes: [],
  stoptimes: [],
};

describe('<TerminalPageContentContainer />', () => {
  it('renders the no-departures indicator when stoptimes is empty', () => {
    const { container } = renderWithProviders(
      <TerminalPageContent
        relay={{ refetch: () => {}, environment: {} }}
        station={station}
      />,
      { config: baseConfig, currentTime: 1000 },
    );

    expect(
      container.querySelector('.stop-no-departures-container'),
    ).not.toBeNull();
  });
});
