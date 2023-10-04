import PropTypes from 'prop-types';
import React from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { graphql, createFragmentContainer } from 'react-relay';
import distance from '@digitransit-search-util/digitransit-search-util-distance';
import StopsNearYouMap from './map/StopsNearYouMap';
import TimeStore from '../store/TimeStore';
import PreferencesStore from '../store/PreferencesStore';
import FavouriteStore from '../store/FavouriteStore';
import { dtLocationShape } from '../util/shapes';

function StopsNearYouFavoritesMapContainer(props) {
  const { stops, stations, bikeStations, position } = props;
  const stopList = [];
  stopList.push(
    ...stops
      .filter(s => s)
      .map(stop => {
        return {
          type: 'stop',
          node: {
            distance: distance(position, stop),
            place: {
              ...stop,
            },
          },
        };
      }),
  );
  stopList.push(
    ...stations
      .filter(s => s)
      .map(stop => {
        return {
          type: 'station',
          node: {
            distance: distance(position, stop),
            place: {
              ...stop,
            },
          },
        };
      }),
  );
  stopList.push(
    ...bikeStations
      .filter(s => s)
      .map(stop => {
        return {
          type: 'bikeRentalStation',
          node: {
            distance: distance(position, stop),
            place: {
              ...stop,
            },
          },
        };
      }),
  );
  stopList.sort((a, b) => a.node.distance - b.node.distance);

  return <StopsNearYouMap {...props} stopsNearYou={stopList} />;
}

StopsNearYouFavoritesMapContainer.propTypes = {
  stops: PropTypes.array,
  stations: PropTypes.array,
  bikeStations: PropTypes.array,
  position: dtLocationShape.isRequired,
};

const StopsNearYouMapWithStores = connectToStores(
  StopsNearYouFavoritesMapContainer,
  [TimeStore, PreferencesStore, FavouriteStore],
  ({ getStore }) => {
    const currentTime = getStore(TimeStore).getCurrentTime().unix();
    const language = getStore(PreferencesStore).getLanguage();
    return {
      language,
      currentTime,
    };
  },
);
const containerComponent = createFragmentContainer(StopsNearYouMapWithStores, {
  stops: graphql`
    fragment StopsNearYouFavoritesMapContainer_stops on Stop
    @relay(plural: true)
    @argumentDefinitions(startTime: { type: "Long!", defaultValue: 0 }) {
      gtfsId
      lat
      lon
      name
      parentStation {
        lat
        lon
        name
        gtfsId
      }
      patterns {
        route {
          gtfsId
          shortName
          mode
        }
        code
        directionId
        patternGeometry {
          points
        }
      }
      stoptimesWithoutPatterns(startTime: $startTime, omitNonPickups: true) {
        scheduledArrival
      }
    }
  `,
  stations: graphql`
    fragment StopsNearYouFavoritesMapContainer_stations on Stop
    @relay(plural: true)
    @argumentDefinitions(startTime: { type: "Long!", defaultValue: 0 }) {
      gtfsId
      lat
      lon
      name
      stops {
        patterns {
          route {
            gtfsId
            shortName
            mode
          }
          code
          directionId
          patternGeometry {
            points
          }
        }
      }
      stoptimesWithoutPatterns(startTime: $startTime, omitNonPickups: true) {
        scheduledArrival
      }
    }
  `,
  bikeStations: graphql`
    fragment StopsNearYouFavoritesMapContainer_bikeStations on BikeRentalStation
    @relay(plural: true) {
      name
      lat
      lon
      stationId
    }
  `,
});

export {
  containerComponent as default,
  StopsNearYouFavoritesMapContainer as Component,
};
