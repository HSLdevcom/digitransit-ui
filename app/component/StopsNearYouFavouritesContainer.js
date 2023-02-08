import PropTypes from 'prop-types';
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import distance from '@digitransit-search-util/digitransit-search-util-distance';
import { dtLocationShape } from '../util/shapes';
import StopNearYouContainer from './StopNearYouContainer';
import CityBikeStopNearYouContainer from './CityBikeStopNearYouContainer';

function StopsNearYouFavouritesContainer({
  stops,
  stations,
  bikeStations,
  searchPosition,
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
    ...bikeStations
      .filter(s => s)
      .map(stop => {
        return {
          type: 'bikeRentalStation',
          distance: distance(searchPosition, stop),
          ...stop,
        };
      }),
  );
  stopList.sort((a, b) => a.distance - b.distance);
  const stopElements = stopList.map(stop => {
    switch (stop.type) {
      case 'stop':
        return (
          <StopNearYouContainer
            key={stop.gtfsId}
            stop={stop}
            currentMode="FAVORITE"
          />
        );
      case 'station':
        return (
          <StopNearYouContainer
            key={stop.gtfsId}
            stop={stop}
            desc={stop.stops[0].desc}
            stopId={stop.stops[0].gtfsId}
          />
        );
      case 'bikeRentalStation':
        return <CityBikeStopNearYouContainer key={stop.name} stop={stop} />;
      default:
        return null;
    }
  });
  return <>{stopElements}</>;
}
StopsNearYouFavouritesContainer.propTypes = {
  stops: PropTypes.array,
  stations: PropTypes.array,
  bikeStations: PropTypes.array,
  searchPosition: dtLocationShape,
  relay: PropTypes.shape({
    refetch: PropTypes.func.isRequired,
  }).isRequired,
};

const refetchContainer = createFragmentContainer(
  StopsNearYouFavouritesContainer,
  {
    stops: graphql`
      fragment StopsNearYouFavouritesContainer_stops on Stop
      @relay(plural: true)
      @argumentDefinitions(startTime: { type: "Long!", defaultValue: 0 }) {
        ...StopNearYouContainer_stop
        gtfsId
        lat
        lon
      }
    `,
    stations: graphql`
      fragment StopsNearYouFavouritesContainer_stations on Stop
      @relay(plural: true)
      @argumentDefinitions(startTime: { type: "Long!", defaultValue: 0 }) {
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
    bikeStations: graphql`
      fragment StopsNearYouFavouritesContainer_bikeStations on BikeRentalStation
      @relay(plural: true) {
        stationId
        name
        bikesAvailable
        spacesAvailable
        capacity
        networks
        lat
        lon
      }
    `,
  },
);

export {
  refetchContainer as default,
  StopsNearYouFavouritesContainer as Component,
};
