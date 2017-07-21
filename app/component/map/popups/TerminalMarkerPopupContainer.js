import React from 'react';
import PropTypes from 'prop-types';

import { QueryRenderer, graphql } from 'react-relay/compat';
import { Store } from 'react-relay/classic';

import StopMarkerPopup from '../popups/StopMarkerPopup';
import Loading from '../../Loading';

export default function TerminalMarkerPopupContainer(props) {
  return (
    <QueryRenderer
      query={graphql.experimental`
        query TerminalMarkerPopupContainerQuery(
          $terminalId: String!
          $startTime: Long!
          $timeRange: Int!
          $numberOfDepartures: Int!
        ) {
          terminal: station(id: $terminalId) {
            ...StopMarkerPopup_terminal
              @arguments(
                startTime: $startTime
                timeRange: $timeRange
                numberOfDepartures: $numberOfDepartures
              )
          }
        }
      `}
      variables={{
        terminalId: props.terminalId,
        currentTime: props.currentTime,
        timeRange: 60 * 60,
        numberOfDepartures: 3 * 5,
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

TerminalMarkerPopupContainer.propTypes = {
  currentTime: PropTypes.number.isRequired,
  terminalId: PropTypes.string.isRequired,
};
