import React from 'react';
import PropTypes from 'prop-types';

import { graphql } from 'react-relay';
import QueryRenderer from 'react-relay/lib/ReactRelayQueryRenderer';

import ParkAndRideHubPopup from './ParkAndRideHubPopup';
import Loading from '../../Loading';
import getRelayEnvironment from '../../../util/getRelayEnvironment';

function ParkAndRideHubPopupContainer(props) {
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
      environment={props.relayEnvironment}
      render={({ props: renderProps }) =>
        renderProps ? (
          <ParkAndRideHubPopup
            {...renderProps}
            lat={props.coords.lat}
            lon={props.coords.lng}
            name={props.name}
          />
        ) : (
          <div className="card" style={{ height: '12rem' }}>
            {' '}
            <Loading />{' '}
          </div>
        )
      }
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
  relayEnvironment: PropTypes.object.isRequired,
};

export default getRelayEnvironment(ParkAndRideHubPopupContainer);
