import React from 'react';
import PropTypes from 'prop-types';

import { graphql } from 'react-relay/compat';
import QueryRenderer from 'react-relay/lib/ReactRelayQueryRenderer';

import StopMarkerPopup from './StopMarkerPopup';
import Loading from '../../Loading';
import getRelayEnvironment from '../../../util/getRelayEnvironment';

function StopMarkerPopupContainer(props) {
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
      environment={props.relayEnvironment}
      render={({ props: renderProps }) =>
        renderProps ? (
          <StopMarkerPopup
            {...renderProps}
            currentTime={props.currentTime}
            terminal={null}
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

StopMarkerPopupContainer.propTypes = {
  currentTime: PropTypes.number.isRequired,
  stopId: PropTypes.string.isRequired,
  relayEnvironment: PropTypes.object.isRequired,
};

export default getRelayEnvironment(StopMarkerPopupContainer);
