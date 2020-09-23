import PropTypes from 'prop-types';
import React from 'react';
import { createRefetchContainer, graphql } from 'react-relay';
import connectToStores from 'fluxible-addons-react/connectToStores';

import MarkerPopupBottom from '../MarkerPopupBottom';
import StopCardContainer from '../../StopCardContainer';

const NUMBER_OF_DEPARTURES = 5;

class TerminalMarkerPopup extends React.PureComponent {
  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps({ relay, currentTime }) {
    const currUnix = this.props.currentTime;
    if (currUnix !== currentTime) {
      relay.refetch(oldVariables => {
        return { ...oldVariables, startTime: currUnix };
      });
    }
  }

  render() {
    const { currentTime, station } = this.props;

    return (
      <div className="card">
        <StopCardContainer
          stop={station}
          currentTime={currentTime}
          isTerminal
          limit={NUMBER_OF_DEPARTURES}
          isPopUp
          className="card-padding"
        />
        <MarkerPopupBottom
          location={{
            address: station.name,
            lat: station.lat,
            lon: station.lon,
          }}
        />
      </div>
    );
  }
}

TerminalMarkerPopup.propTypes = {
  station: PropTypes.object,
  currentTime: PropTypes.number.isRequired,
  relay: PropTypes.shape({
    refetch: PropTypes.func.isRequired,
  }).isRequired,
};

const TerminalMarkerPopupContainer = createRefetchContainer(
  connectToStores(TerminalMarkerPopup, ['TimeStore'], ({ getStore }) => ({
    currentTime: getStore('TimeStore').getCurrentTime().unix(),
  })),
  {
    station: graphql`
      fragment TerminalMarkerPopup_station on Stop
      @argumentDefinitions(
        startTime: { type: "Long!", defaultValue: 0 }
        timeRange: { type: "Long!", defaultValue: 3600 }
        numberOfDepartures: { type: "Int!", defaultValue: 15 }
      ) {
        gtfsId
        lat
        lon
        name
        ...StopCardContainer_stop
        @arguments(
          startTime: $startTime
          timeRange: $timeRange
          numberOfDepartures: $numberOfDepartures
        )
      }
    `,
  },
  graphql`
    query TerminalMarkerPopupQuery(
      $terminalId: String!
      $startTime: Long!
      $timeRange: Long!
      $numberOfDepartures: Int!
    ) {
      station(id: $terminalId) {
        ...TerminalMarkerPopup_station
        @arguments(
          startTime: $startTime
          timeRange: $timeRange
          numberOfDepartures: $numberOfDepartures
        )
      }
    }
  `,
);

export default TerminalMarkerPopupContainer;
