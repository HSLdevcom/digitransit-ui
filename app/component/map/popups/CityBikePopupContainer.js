import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import { graphql } from 'relay-runtime';
import QueryRenderer from 'react-relay/lib/ReactRelayQueryRenderer';
import ReactRelayContext from 'react-relay/lib/ReactRelayContext';

import CityBikePopup from './CityBikePopup';
import Loading from '../../Loading';

function CityBikePopupContainer({ stationId }) {
  const relayEnvironment = useContext(ReactRelayContext);
  return (
    <QueryRenderer
      query={graphql`
        query CityBikePopupContainerQuery($stationId: String!) {
          station: bikeRentalStation(id: $stationId) {
            ...CityBikePopup_station
          }
        }
      `}
      cacheConfig={{ force: true, poll: 30 * 1000 }}
      variables={{ stationId }}
      environment={relayEnvironment}
      render={({ props: renderProps }) =>
        renderProps ? (
          <CityBikePopup {...renderProps} />
        ) : (
          <div className="card" style={{ height: '12rem' }}>
            <Loading />
          </div>
        )
      }
    />
  );
}

CityBikePopupContainer.propTypes = {
  stationId: PropTypes.string.isRequired,
};

export default CityBikePopupContainer;
