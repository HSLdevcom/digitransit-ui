import React from 'react';
import { screen } from '@testing-library/react';
import { Component as DepartureListContainer } from '../../../app/component/DepartureListContainer';
import {
  startRealTimeClient,
  stopRealTimeClient,
} from '../../../app/action/realTimeClientAction';
import { createTestConfig } from '../helpers/mock-context';
import { renderWithProviders } from '../helpers/mock-providers';

// The global MockLink (vitest.setup.js) drops DepartureRow's `as="tr"`, which
// makes its <td>s invalid DOM; the row itself isn't under test here.
vi.mock('../../../app/component/DepartureRow', () => ({
  // eslint-disable-next-line react/prop-types
  default: ({ departure }) => (
    <tr>
      <td>{departure.headsign}</td>
    </tr>
  ),
}));

const serviceDay = 1700000000;
const currentTime = serviceDay + 1000;

const route = {
  gtfsId: 'HSL:1001',
  shortName: '1',
  longName: 'Eira - Kamppi',
  mode: 'BUS',
  alerts: [],
};

const makeStoptime = ({ id, stopId = 'HSL:1', headsign, lastStopId }) => ({
  realtimeState: 'SCHEDULED',
  realtime: true,
  serviceDay,
  scheduledDeparture: 2000,
  realtimeDeparture: 2000,
  scheduledArrival: 2000,
  realtimeArrival: 2000,
  pickupType: lastStopId === stopId ? 'NONE' : 'SCHEDULED',
  dropoffType: 'SCHEDULED',
  headsign,
  stop: { id: stopId, gtfsId: stopId, code: '1', platformCode: null },
  trip: {
    gtfsId: `HSL:${id}`,
    tripHeadsign: headsign,
    stops: [{ id: 'HSL:0' }, { id: lastStopId || 'HSL:2' }],
    pattern: {
      code: `HSL:1001:0:${id}`,
      route,
      stops: [{ gtfsId: stopId, code: '1' }],
    },
  },
});

describe('<DepartureListContainer />', () => {
  it('renders headsigns, and "Arrives / Terminus" for last-stop arrivals', () => {
    renderWithProviders(
      <DepartureListContainer
        stoptimes={[
          makeStoptime({ id: 'a', headsign: 'Kamppi' }),
          makeStoptime({ id: 'b', headsign: 'Eira', lastStopId: 'HSL:1' }),
        ]}
        currentTime={currentTime}
      />,
      { currentTime },
    );
    expect(screen.getByText('Kamppi')).toBeTruthy();
    expect(screen.getByText('Arrives / Terminus')).toBeTruthy();
  });

  it('starts the realtime client on mount and stops it on unmount', () => {
    const executeAction = vi.fn();
    const client = {};
    const config = createTestConfig({
      showVehiclesOnStopPage: true,
      feedIds: ['HSL'],
      realTime: { HSL: { active: true } },
    });
    const { unmount } = renderWithProviders(
      <DepartureListContainer
        stoptimes={[makeStoptime({ id: 'a', headsign: 'Kamppi' })]}
        currentTime={currentTime}
        showVehicles
      />,
      {
        config,
        currentTime,
        executeAction,
        getStore: () => ({ client, topics: [] }),
      },
    );
    expect(executeAction).toHaveBeenCalledWith(
      startRealTimeClient,
      expect.objectContaining({
        feedId: 'HSL',
        options: [{ tripId: 'a' }],
      }),
    );

    unmount();
    expect(executeAction).toHaveBeenCalledWith(stopRealTimeClient, client);
  });
});
