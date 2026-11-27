import { renderHook, waitFor } from '@testing-library/react';
import useNearestScooters from '../../../../../src/client/component/itinerary/useNearestScooters';
import TestProviders from '../../../helpers/mock-providers';
import { mockContext } from '../../../helpers/mock-context';
import { relayMock } from '../../../helpers/mock-relay';

const config = {
  ...mockContext.config,
  vehicleRental: { maxNearbyRentalVehicleAmount: 5, maxDistanceToRentalVehiclesInMeters: 300 },
};
const wrapper = ({ children }) => <TestProviders config={config}>{children}</TestProviders>;

const edge = (type, network) => ({
  node: { place: { __typename: type, rentalNetwork: { networkId: network } } },
});

const place = { lat: 60.1, lon: 24.9 };

describe('useNearestScooters', () => {
  it('does not query unless enabled', () => {
    renderHook(() => useNearestScooters({}, place, 'own', false), { wrapper });
    expect(relayMock.fetchCalls).toHaveLength(0);
  });

  it('queries once and returns one scooter per other network', async () => {
    relayMock.fetch(null, {
      viewer: {
        nearest: {
          edges: [
            edge('RentalVehicle', 'own'),
            edge('RentalVehicle', 'a'),
            edge('RentalVehicle', 'a'),
            edge('RentalVehicle', 'b'),
            edge('VehicleRentalStation', 'c'),
          ],
        },
      },
    });
    const env = {};
    const { result, rerender } = renderHook(() => useNearestScooters(env, place, 'own', true), {
      wrapper,
    });
    await waitFor(() => expect(result.current).toHaveLength(2));
    expect(result.current.map(e => e.node.place.rentalNetwork.networkId)).toEqual(['a', 'b']);
    rerender();
    expect(relayMock.fetchCalls).toHaveLength(1);
    expect(relayMock.fetchCalls[0].variables).toMatchObject({
      lat: 60.1,
      lon: 24.9,
      maxResults: 5,
      maxDistance: 300,
      filterByModes: ['SCOOTER'],
    });
  });

  it('returns an empty list when the query fails', async () => {
    relayMock.fetch(null, () => Promise.reject(new Error('fail')));
    const { result } = renderHook(() => useNearestScooters({}, place, 'own', true), { wrapper });
    await waitFor(() => expect(relayMock.fetchCalls).toHaveLength(1));
    expect(result.current).toEqual([]);
  });
});
