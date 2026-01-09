import PropTypes from 'prop-types';
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import distance from '@digitransit-search-util/digitransit-search-util-distance';
import NearYouMap from '../map/NearYouMap';
import {
  vehicleRentalStationShape,
  stopShape,
  stationShape,
  locationShape,
} from '../../util/shapes';

function NearYouFavouritesMapContainer(props) {
  const { stops, stations, vehicleStations, position } = props;
  const favs = [
    ...(stops || []),
    ...(stations || []),
    ...(vehicleStations || []),
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

  return <NearYouMap {...props} stops={edges} />;
}

NearYouFavouritesMapContainer.propTypes = {
  stops: PropTypes.arrayOf(stopShape),
  stations: PropTypes.arrayOf(stationShape),
  vehicleStations: PropTypes.arrayOf(vehicleRentalStationShape),
  position: locationShape.isRequired,
};

NearYouFavouritesMapContainer.defaultProps = {
  stops: [],
  stations: [],
  vehicleStations: [],
};

const containerComponent = createFragmentContainer(
  NearYouFavouritesMapContainer,
  {
    stops: graphql`
      fragment NearYouFavouritesMapContainer_stops on Stop
      @relay(plural: true) {
        gtfsId
        lat
        lon
        patterns {
          route {
            gtfsId
            shortName
            mode
            type
          }
          code
          patternGeometry {
            points
          }
        }
      }
    `,
    stations: graphql`
      fragment NearYouFavouritesMapContainer_stations on Stop
      @relay(plural: true) {
        gtfsId
        lat
        lon
        stops {
          patterns {
            route {
              gtfsId
              shortName
              mode
              type
            }
            code
            patternGeometry {
              points
            }
          }
        }
      }
    `,
    vehicleStations: graphql`
      fragment NearYouFavouritesMapContainer_vehicleStations on VehicleRentalStation
      @relay(plural: true) {
        name
        lat
        lon
        stationId
      }
    `,
  },
);

export {
  containerComponent as default,
  NearYouFavouritesMapContainer as Component,
};
