import PropTypes from 'prop-types';
import { useFragment } from 'react-relay';
import distance from '@digitransit-search-util/digitransit-search-util-distance';
import NearYouMap from '../map/NearYouMap';
import { locationShape, fragmentRefShape } from '../../../utils/client/shapes';
import NearYouFavouritesMapFragment from './queries/NearYouFavouritesMapFragment';

const EMPTY_ARRAY = [];

export default function NearYouFavouritesMapContainer({
  stops: stopsRef,
  stations: stationsRef,
  vehicleStations: vehicleStationsRef,
  position,
  ...rest
}) {
  const stops = useFragment(NearYouFavouritesMapFragment.stops, stopsRef);
  const stations = useFragment(
    NearYouFavouritesMapFragment.stations,
    stationsRef,
  );
  const vehicleStations = useFragment(
    NearYouFavouritesMapFragment.vehicleStations,
    vehicleStationsRef,
  );
  // guard against useFragment returning null
  const favs = [
    ...(stops || EMPTY_ARRAY),
    ...(stations || EMPTY_ARRAY),
    ...(vehicleStations || EMPTY_ARRAY),
  ];
  const edges = favs
    .filter(s => s)
    .map(stop => {
      return {
        node: {
          distance: distance(position, stop),
          place: { ...stop },
        },
      };
    })
    .sort((a, b) => a.node.distance - b.node.distance);

  return (
    <NearYouMap
      {...rest}
      stops={edges}
      stations={stations}
      vehicleStations={vehicleStations}
      position={position}
    />
  );
}

NearYouFavouritesMapContainer.propTypes = {
  stops: PropTypes.arrayOf(fragmentRefShape),
  stations: PropTypes.arrayOf(fragmentRefShape),
  vehicleStations: PropTypes.arrayOf(fragmentRefShape),
  position: locationShape.isRequired,
};
