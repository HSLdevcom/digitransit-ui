import PropTypes from 'prop-types';
import React from 'react';
import { graphql, QueryRenderer, ReactRelayContext } from 'react-relay';
import { locationShape, relayShape } from '../../../utils/client/shapes';
import NearYouFavouritesContainer from './NearYouFavouritesContainer';
import withBreakpoint from '../../../utils/client/withBreakpoint';
import Loading from '../Loading';
import NoFavourites from './NoFavourites';

function NearYouFavourites({
  stopIds,
  stationIds,
  vehicleRentalStationIds,
  relayEnvironment,
  searchPosition,
  breakpoint,
  noFavourites = false,
  isParentTabActive = false,
  currentTime,
}) {
  if (noFavourites) {
    return <NoFavourites breakpoint={breakpoint} />;
  }
  return (
    <QueryRenderer
      query={graphql`
        query NearYouFavouritesQuery(
          $stopIds: [String!]!
          $stationIds: [String!]!
          $vehicleRentalStationIds: [String!]!
        ) {
          stops: stops(ids: $stopIds) {
            ...NearYouFavouritesContainer_stops
          }
          stations: stations(ids: $stationIds) {
            ...NearYouFavouritesContainer_stations
          }
          vehicleStations: vehicleRentalStations(
            ids: $vehicleRentalStationIds
          ) {
            ...NearYouFavouritesContainer_vehicleStations
          }
        }
      `}
      variables={{
        stopIds: stopIds || [],
        stationIds: stationIds || [],
        vehicleRentalStationIds: vehicleRentalStationIds || [],
      }}
      environment={relayEnvironment}
      render={({ props }) => {
        if (props) {
          return (
            <NearYouFavouritesContainer
              searchPosition={searchPosition}
              isParentTabActive={isParentTabActive}
              currentTime={currentTime}
              breakpoint={breakpoint}
              {...props}
            />
          );
        }
        return <Loading />;
      }}
    />
  );
}
NearYouFavourites.propTypes = {
  stopIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  stationIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  vehicleRentalStationIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  relayEnvironment: relayShape.isRequired,
  searchPosition: locationShape.isRequired,
  breakpoint: PropTypes.string,
  noFavourites: PropTypes.bool,
  isParentTabActive: PropTypes.bool,
  currentTime: PropTypes.number.isRequired,
};

const NearYouFavouritesWithBreakpoint = withBreakpoint(props => (
  <ReactRelayContext.Consumer>
    {({ environment }) => (
      <NearYouFavourites {...props} relayEnvironment={environment} />
    )}
  </ReactRelayContext.Consumer>
));

export default NearYouFavouritesWithBreakpoint;
