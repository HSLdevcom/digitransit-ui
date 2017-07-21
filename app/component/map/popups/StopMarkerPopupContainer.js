import React from 'react';
import PropTypes from 'prop-types';

import { QueryRenderer, graphql } from 'react-relay/compat';
import { Store } from 'react-relay/classic';

import StopMarkerPopup from '../popups/StopMarkerPopup';
import Loading from '../../Loading';

export default function StopMarkerPopupContainer(props) {
  return (
    <QueryRenderer
      query={graphql.experimental`
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
        currentTime: props.currentTime,
        timeRange: 12 * 60 * 60,
        numberOfDepartures: 5,
      }}
      environment={Store}
      render={({ props: renderProps }) =>
        renderProps
          ? <StopMarkerPopup {...renderProps} currentTime={props.currentTime} />
          : <div className="card" style={{ height: '12rem' }}>
              <Loading />
            </div>}
    />
  );
}

StopMarkerPopupContainer.propTypes = {
  currentTime: PropTypes.number.isRequired,
  stopId: PropTypes.string.isRequired,
};
