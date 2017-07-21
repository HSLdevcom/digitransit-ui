import React from 'react';
import PropTypes from 'prop-types';

import { QueryRenderer, graphql } from 'react-relay/compat';
import { Store } from 'react-relay/classic';

import ParkAndRideHubPopup from '../popups/ParkAndRideHubPopup';
import Loading from '../../Loading';

export default function ParkAndRideHubPopupContainer(props) {
  return (
    <QueryRenderer
      query={graphql`
        query ParkAndRideHubPopupContainerQuery($stationIds: [String!]) {
          facilities: carParks(ids: $stationIds) {
            ...ParkAndRideHubPopup_facilities
          }
        }
      `}
      variables={{ stationIds: props.ids }}
      environment={Store}
      render={({ props: renderProps }) =>
        renderProps
          ? <ParkAndRideHubPopup
              {...renderProps}
              lat={props.coords.lat}
              lon={props.coords.lng}
              name={props.name}
            />
          : <div className="card" style={{ height: '12rem' }}>
              <Loading />
            </div>}
    />
  );
}

ParkAndRideHubPopupContainer.propTypes = {
  ids: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  coords: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }).isRequired,
  name: PropTypes.string.isRequired,
};
