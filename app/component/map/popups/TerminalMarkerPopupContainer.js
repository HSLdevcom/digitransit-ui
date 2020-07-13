import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import { graphql } from 'react-relay';
import QueryRenderer from 'react-relay/lib/ReactRelayQueryRenderer';
import ReactRelayContext from 'react-relay/lib/ReactRelayContext';

import TerminalMarkerPopup from './TerminalMarkerPopup';
import Loading from '../../Loading';

function TerminalMarkerPopupContainer(props) {
  const relayEnvironment = useContext(ReactRelayContext);
  return (
    <QueryRenderer
      query={graphql`
        query TerminalMarkerPopupContainerQuery(
          $terminalId: String!
          $startTime: Long!
          $timeRange: Int!
          $numberOfDepartures: Int!
        ) {
          station: station(id: $terminalId) {
            ...TerminalMarkerPopup_station
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
      environment={relayEnvironment}
      render={({ props: renderProps }) =>
        renderProps ? (
          <TerminalMarkerPopup
            {...renderProps}
            currentTime={props.currentTime}
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
};

export default TerminalMarkerPopupContainer;
