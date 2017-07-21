import React from 'react';
import PropTypes from 'prop-types';

import { QueryRenderer, graphql } from 'react-relay/compat';
import { Store } from 'react-relay/classic';

import ParkAndRideFacilityPopup from '../popups/ParkAndRideFacilityPopup';
import Loading from '../../Loading';

export default function ParkAndRideFacilityPopupContainer(props) {
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
      environment={Store}
      render={({ props: renderProps }) =>
        renderProps
          ? <ParkAndRideFacilityPopup
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

ParkAndRideFacilityPopupContainer.propTypes = {
  id: PropTypes.string.isRequired,
  coords: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }).isRequired,
  name: PropTypes.string.isRequired,
};
