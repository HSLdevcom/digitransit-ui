import React from 'react';
import PropTypes from 'prop-types';

import { graphql } from 'react-relay';
import QueryRenderer from 'react-relay/lib/ReactRelayQueryRenderer';

import TerminalMarkerPopup from './TerminalMarkerPopup';
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
      environment={props.relayEnvironment}
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
  relayEnvironment: PropTypes.object.isRequired,
};

export default getRelayEnvironment(TerminalMarkerPopupContainer);
