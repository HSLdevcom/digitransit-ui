import React from 'react';
import PropTypes from 'prop-types';

import { graphql } from 'react-relay';
import QueryRenderer from 'react-relay/lib/ReactRelayQueryRenderer';

import ParkAndRideFacilityPopup from './ParkAndRideFacilityPopup';
import Loading from '../../Loading';
import getRelayEnvironment from '../../../util/getRelayEnvironment';

function ParkAndRideFacilityPopupContainer(props) {
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
      environment={props.relayEnvironment}
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
  relayEnvironment: PropTypes.object.isRequired,
};

export default getRelayEnvironment(ParkAndRideFacilityPopupContainer);
