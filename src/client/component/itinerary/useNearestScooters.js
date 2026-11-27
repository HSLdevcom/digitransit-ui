import { useEffect, useState } from 'react';
import { fetchQuery } from 'react-relay';
import nearestQuery from './NearestQuery';
import { useConfigContext } from '../../hooks/ConfigContext';

/**
 * Fetches scooters near the given place, one from each network other than excludedNetworkId.
 * Nothing is fetched unless enabled.
 */
export default function useNearestScooters(relayEnvironment, place, excludedNetworkId, enabled) {
  const { vehicleRental } = useConfigContext();
  const [nearest, setNearest] = useState([]);
  const { lat, lon } = place;

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }
    let cancelled = false;
    const amount = vehicleRental.maxNearbyRentalVehicleAmount;
    const params = {
      lat,
      lon,
      maxResults: amount,
      first: amount,
      maxDistance: vehicleRental.maxDistanceToRentalVehiclesInMeters,
      filterByModes: ['SCOOTER'],
      filterByPlaceTypes: ['VEHICLE_RENT'],
    };

    fetchQuery(relayEnvironment, nearestQuery, params, { force: true })
      .toPromise()
      .then(result => {
        if (cancelled || !result) {
          return;
        }
        const networkOf = edge => edge.node.place.rentalNetwork.networkId;
        const scooters = (result.viewer.nearest.edges || []).filter(
          edge =>
            edge.node.place.__typename === 'RentalVehicle' && // eslint-disable-line no-underscore-dangle
            networkOf(edge) !== excludedNetworkId,
        );
        // show only one scooter from each network
        setNearest(
          scooters.filter(
            (edge, i) => scooters.findIndex(e => networkOf(e) === networkOf(edge)) === i,
          ),
        );
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [enabled, relayEnvironment, lat, lon, excludedNetworkId, vehicleRental]);

  return nearest;
}
