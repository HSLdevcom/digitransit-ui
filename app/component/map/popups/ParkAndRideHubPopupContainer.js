import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import { graphql } from 'react-relay';
import QueryRenderer from 'react-relay/lib/ReactRelayQueryRenderer';
import ReactRelayContext from 'react-relay/lib/ReactRelayContext';

import ParkAndRideHubPopup from './ParkAndRideHubPopup';
import Loading from '../../Loading';

function ParkAndRideHubPopupContainer(props) {
  const { environment } = useContext(ReactRelayContext);
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
      environment={environment}
      render={({ props: renderProps }) =>
        renderProps ? (
          <ParkAndRideHubPopup
            {...renderProps}
            lat={props.coords.lat}
            lon={props.coords.lng}
            name={props.name}
            locationPopup={props.locationPopup}
            onSelectLocation={props.onSelectLocation}
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
  locationPopup: PropTypes.string,
  onSelectLocation: PropTypes.func,
};

export default ParkAndRideHubPopupContainer;
