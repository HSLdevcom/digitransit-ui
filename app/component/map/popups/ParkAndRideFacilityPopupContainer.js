import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import { graphql } from 'react-relay';
import QueryRenderer from 'react-relay/lib/ReactRelayQueryRenderer';
import ReactRelayContext from 'react-relay/lib/ReactRelayContext';

import ParkAndRideFacilityPopup from './ParkAndRideFacilityPopup';
import Loading from '../../Loading';

function ParkAndRideFacilityPopupContainer(props) {
  const relayEnvironment = useContext(ReactRelayContext);
  return (
    <QueryRenderer
      query={graphql`
        query ParkAndRideFacilityPopupContainerQuery($stationId: String!) {
          facility: carPark(id: $stationId) {
            ...ParkAndRideFacilityPopup_facility
          }
        }
      `}
      variables={{ stationId: props.id }}
      environment={relayEnvironment}
      render={({ props: renderProps }) =>
        renderProps ? (
          <ParkAndRideFacilityPopup
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

ParkAndRideFacilityPopupContainer.propTypes = {
  id: PropTypes.string.isRequired,
  coords: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }).isRequired,
  name: PropTypes.string.isRequired,
};

export default ParkAndRideFacilityPopupContainer;
