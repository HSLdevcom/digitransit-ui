import PropTypes from 'prop-types';
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import distance from '@digitransit-search-util/digitransit-search-util-distance';
import {
  stopShape,
  stationShape,
  vehicleRentalStationShape,
  locationShape,
} from '../../../utils/client/shapes';
import StopNearYouContainer from './StopNearYouContainer';
import VehicleRentalStationNearYou from './VehicleRentalStationNearYou';
import NoFavourites from './NoFavourites';

function NearYouFavouritesContainer({
  stops,
  stations,
  vehicleStations,
  searchPosition,
  isParentTabActive,
  currentTime,
  breakpoint,
}) {
  const stopList = [];
  stopList.push(
    ...stops
      .filter(s => s)
      .map(stop => {
        return {
          type: 'stop',
          distance: distance(searchPosition, stop),
          ...stop,
        };
      }),
  );
  stopList.push(
    ...stations
      .filter(s => s)
      .map(stop => {
        return {
          type: 'station',
          distance: distance(searchPosition, stop),
          ...stop,
        };
      }),
  );
  stopList.push(
    ...vehicleStations
      .filter(s => s)
      .map(stop => {
        return {
          type: 'vehicleRentalStation',
          distance: distance(searchPosition, stop),
          ...stop,
        };
      }),
  );
  stopList.sort((a, b) => a.distance - b.distance);
  // All saved favourites may still exist locally but no longer resolve
  // against live data (e.g. a discontinued citybike station or a removed
  // stop). Show the same guidance as having no favourites at all instead of
  // an empty list.
  if (!stopList.length) {
    return <NoFavourites breakpoint={breakpoint} />;
  }
  const stopElements = stopList.map(stop => {
    switch (stop.type) {
      case 'stop':
      case 'station':
        return (
          <StopNearYouContainer
            key={stop.gtfsId}
            stop={stop}
            isParentTabActive={isParentTabActive}
            currentTime={currentTime}
          />
        );
      case 'vehicleRentalStation':
        return (
          <VehicleRentalStationNearYou
            key={stop.name}
            station={stop}
            isParentTabActive={isParentTabActive}
            currentTime={currentTime}
          />
        );
      default:
        return null;
    }
  });
  return stopElements;
}

NearYouFavouritesContainer.propTypes = {
  stops: PropTypes.arrayOf(stopShape),
  stations: PropTypes.arrayOf(stationShape),
  vehicleStations: PropTypes.arrayOf(vehicleRentalStationShape),
  searchPosition: locationShape,
  isParentTabActive: PropTypes.bool,
  currentTime: PropTypes.number.isRequired,
  breakpoint: PropTypes.string,
};

const refetchContainer = createFragmentContainer(NearYouFavouritesContainer, {
  stops: graphql`
    fragment NearYouFavouritesContainer_stops on Stop @relay(plural: true) {
      ...StopNearYouContainer_stop
      gtfsId
      lat
      lon
    }
  `,
  stations: graphql`
    fragment NearYouFavouritesContainer_stations on Stop @relay(plural: true) {
      ...StopNearYouContainer_stop
      gtfsId
      lat
      lon
      stops {
        gtfsId
        desc
      }
    }
  `,
  vehicleStations: graphql`
    fragment NearYouFavouritesContainer_vehicleStations on VehicleRentalStation
    @relay(plural: true) {
      ...VehicleRentalStationNearYou_station
      stationId
      name
      availableVehicles {
        total
      }
      availableSpaces {
        total
      }
      capacity
      rentalNetwork {
        networkId
      }
      lat
      lon
      operative
    }
  `,
});

export { refetchContainer as default, NearYouFavouritesContainer as Component };
