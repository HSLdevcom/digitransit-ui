import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import { graphql } from 'react-relay';
import QueryRenderer from 'react-relay/lib/ReactRelayQueryRenderer';
import ReactRelayContext from 'react-relay/lib/ReactRelayContext';

import StopMarkerPopup from './StopMarkerPopup';
import Loading from '../../Loading';

function StopMarkerPopupContainer(props) {
  const relayEnvironment = useContext(ReactRelayContext);
  return (
    <QueryRenderer
      query={graphql`
        query StopMarkerPopupContainerQuery(
          $stopId: String!
          $startTime: Long!
          $timeRange: Int!
          $numberOfDepartures: Int!
        ) {
          stop(id: $stopId) {
            ...StopMarkerPopup_stop
              @arguments(
                startTime: $startTime
                timeRange: $timeRange
                numberOfDepartures: $numberOfDepartures
              )
          }
        }
      `}
      variables={{
        stopId: props.stopId,
        startTime: props.currentTime,
        timeRange: 12 * 60 * 60,
        numberOfDepartures: 5,
      }}
      environment={relayEnvironment}
      render={({ props: renderProps }) =>
        renderProps ? (
          <StopMarkerPopup {...renderProps} currentTime={props.currentTime} />
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

StopMarkerPopupContainer.propTypes = {
  currentTime: PropTypes.number.isRequired,
  stopId: PropTypes.string.isRequired,
};

export default StopMarkerPopupContainer;
