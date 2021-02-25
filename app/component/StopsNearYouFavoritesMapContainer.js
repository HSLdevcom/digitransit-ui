import connectToStores from 'fluxible-addons-react/connectToStores';
import { graphql, createFragmentContainer } from 'react-relay';
import StopsNearYouMap from './map/StopsNearYouMap';
import TimeStore from '../store/TimeStore';
import PreferencesStore from '../store/PreferencesStore';
import FavouriteStore from '../store/FavouriteStore';

const StopsNearYouMapWithStores = connectToStores(
  StopsNearYouMap,
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

export default containerComponent;
