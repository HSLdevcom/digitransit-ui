import React from 'react';
import PropTypes from 'prop-types';

import { graphql } from 'react-relay';
import QueryRenderer from 'react-relay/lib/ReactRelayQueryRenderer';

import StopMarkerPopup from './StopMarkerPopup';
import Loading from '../../Loading';
import getRelayEnvironment from '../../../util/getRelayEnvironment';

function TerminalMarkerPopupContainer(props) {
  return (
    <QueryRenderer
      query={graphql`
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
        startTime: props.currentTime,
        timeRange: 60 * 60,
        numberOfDepartures: 3 * 5,
      }}
      environment={props.relayEnvironment}
      render={({ props: renderProps }) =>
        renderProps ? (
          <StopMarkerPopup
            {...renderProps}
            currentTime={props.currentTime}
            stop={null}
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

TerminalMarkerPopupContainer.propTypes = {
  currentTime: PropTypes.number.isRequired,
  terminalId: PropTypes.string.isRequired,
  relayEnvironment: PropTypes.object.isRequired,
};

export default getRelayEnvironment(TerminalMarkerPopupContainer);
