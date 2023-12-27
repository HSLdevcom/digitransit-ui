import PropTypes from 'prop-types';
import React from 'react';
import { graphql, QueryRenderer, ReactRelayContext } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { dtLocationShape } from '../util/shapes';
import StopsNearYouFavouritesContainer from './StopsNearYouFavouritesContainer';
import withBreakpoint from '../util/withBreakpoint';
import Loading from './Loading';

function StopsNearYouFavorites({
  favoriteStops,
  favoriteStations,
  favoriteVehicleRentalStationIds,
  relayEnvironment,
  searchPosition,
  breakpoint,
  noFavorites,
  favouritesFetched,
}) {
  if (!favouritesFetched) {
    return <Loading />;
  }
  if (noFavorites) {
    return (
      <div className="no-favorites-container">
        {breakpoint !== 'large' && (
          <div className="no-favorites-header">
            <FormattedMessage id="nearest-favorites" />
          </div>
        )}
        <div className="no-favorites-content">
          <FormattedMessage id="nearest-favorites-no-favorites" />
        </div>
        <>
          <img
            className="instruction-image"
            src={`/img/nearby-stop_${
              breakpoint === 'large' ? 'desktop-' : ''
            }animation.gif`}
            alt="Käyttöohje"
          />
          <FormattedMessage id="nearest-favorites-browse-stops" />
        </>
      </div>
    );
  }
  return (
    <QueryRenderer
      query={graphql`
        query StopsNearYouFavoritesQuery(
          $stopIds: [String!]!
          $stationIds: [String!]!
          $vehicleRentalStationIds: [String!]!
        ) {
          stops: stops(ids: $stopIds) {
            ...StopsNearYouFavouritesContainer_stops
          }
          stations: stations(ids: $stationIds) {
            ...StopsNearYouFavouritesContainer_stations
          }
          vehicleStations: vehicleRentalStations(
            ids: $vehicleRentalStationIds
          ) {
            ...StopsNearYouFavouritesContainer_vehicleStations
          }
        }
      `}
      variables={{
        stopIds: favoriteStops || [],
        stationIds: favoriteStations || [],
        vehicleRentalStationIds: favoriteVehicleRentalStationIds || [],
      }}
      environment={relayEnvironment}
      render={({ props }) => {
        if (props) {
          return (
            <StopsNearYouFavouritesContainer
              searchPosition={searchPosition}
              stops={props.stops}
              stations={props.stations}
              vehicleStations={props.vehicleStations}
            />
          );
        }
        return <Loading />;
      }}
    />
  );
}
StopsNearYouFavorites.propTypes = {
  favoriteStops: PropTypes.array,
  favoriteStations: PropTypes.array,
  favoriteVehicleRentalStationIds: PropTypes.array,
  relayEnvironment: PropTypes.object.isRequired,
  searchPosition: dtLocationShape.isRequired,
  stops: PropTypes.array,
  stations: PropTypes.array,
  vehicleStations: PropTypes.array,
  breakpoint: PropTypes.string,
  noFavorites: PropTypes.bool,
  favouritesFetched: PropTypes.bool,
};

const StopsNearYouFavoritesWithBreakpoint = withBreakpoint(props => (
  <ReactRelayContext.Consumer>
    {({ environment }) => (
      <StopsNearYouFavorites {...props} relayEnvironment={environment} />
    )}
  </ReactRelayContext.Consumer>
));

export default StopsNearYouFavoritesWithBreakpoint;
