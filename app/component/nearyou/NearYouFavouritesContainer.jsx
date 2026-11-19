import { Suspense } from 'react';
import PropTypes from 'prop-types';
import { useFragment } from 'react-relay';
import distance from '@digitransit-search-util/digitransit-search-util-distance';
import { locationShape, fragmentRefShape } from '../../../utils/client/shapes';
import StopNearYou from './StopNearYou';
import VehicleRentalStationNearYou from './VehicleRentalStationNearYou';
import NoFavourites from './NoFavourites';
import Loading from '../Loading';
import NearYouFavouritesFragment from './queries/NearYouFavouritesFragment';

export default function NearYouFavouritesContainer({
  stops: stopsRef,
  stations: stationsRef,
  vehicleStations: vehicleStationsRef,
  searchPosition,
  isParentTabActive,
  breakpoint,
}) {
  const stops = useFragment(NearYouFavouritesFragment.stops, stopsRef);
  const stations = useFragment(NearYouFavouritesFragment.stations, stationsRef);
  const vehicleStations = useFragment(
    NearYouFavouritesFragment.vehicleStations,
    vehicleStationsRef,
  );
  const stopList = [];
  stopList.push(
    ...(stops || [])
      .filter(s => s)
      .map(stop => {
        return { type: 'stop', distance: distance(searchPosition, stop), ...stop };
      }),
  );
  stopList.push(
    ...(stations || [])
      .filter(s => s)
      .map(stop => {
        return { type: 'station', distance: distance(searchPosition, stop), ...stop };
      }),
  );
  stopList.push(
    ...(vehicleStations || [])
      .filter(s => s)
      .map(stop => {
        return { type: 'vehicleRentalStation', distance: distance(searchPosition, stop), ...stop };
      }),
  );
  stopList.sort((a, b) => a.distance - b.distance);
  // Fall back to guidance if the display query resolves no favourites,
  // even when the cached OTP validation indicated some were available.
  if (!stopList.length) {
    return <NoFavourites breakpoint={breakpoint} />;
  }
  const stopElements = stopList.map(stop => {
    switch (stop.type) {
      case 'stop':
      case 'station':
        return <StopNearYou key={stop.gtfsId} stop={stop} isParentTabActive={isParentTabActive} />;
      case 'vehicleRentalStation':
        return (
          <VehicleRentalStationNearYou
            key={stop.name}
            station={stop}
            isParentTabActive={isParentTabActive}
          />
        );
      default:
        return null;
    }
  });
  return <Suspense fallback={<Loading />}>{stopElements}</Suspense>;
}

NearYouFavouritesContainer.propTypes = {
  stops: PropTypes.arrayOf(fragmentRefShape),
  stations: PropTypes.arrayOf(fragmentRefShape),
  vehicleStations: PropTypes.arrayOf(fragmentRefShape),
  searchPosition: locationShape,
  isParentTabActive: PropTypes.bool,
  breakpoint: PropTypes.string,
};
