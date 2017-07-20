import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import StopCardContainer from '../../StopCardContainer';
import MarkerPopupBottom from '../MarkerPopupBottom';

const NUMBER_OF_DEPARTURES = 5;

function StopMarkerPopup(props) {
  const stop = props.stop || props.terminal;
  const terminal = props.terminal !== null;

  return (
    <div className="card">
      <StopCardContainer
        stop={stop}
        currentTime={props.currentTime}
        isTerminal={terminal}
        limit={NUMBER_OF_DEPARTURES}
        className="padding-small cursor-pointer"
      />
      <MarkerPopupBottom
        location={{
          address: stop.name,
          lat: stop.lat,
          lon: stop.lon,
        }}
      />
    </div>
  );
}

StopMarkerPopup.propTypes = {
  stop: PropTypes.object,
  terminal: PropTypes.object,
  currentTime: PropTypes.number.isRequired,
};

export default createFragmentContainer(StopMarkerPopup, {
  stop: graphql.experimental`
    fragment StopMarkerPopup_stop on Stop
      @argumentDefinitions(
        startTime: { type: "Long" }
        timeRange: { type: "Int", defaultValue: 43200 }
        numberOfDepartures: { type: "Int", defaultValue: 5 }
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
  terminal: graphql.experimental`
    fragment StopMarkerPopup_terminal on Stop
      @argumentDefinitions(
        startTime: { type: "Long" }
        timeRange: { type: "Int", defaultValue: 3600 }
        numberOfDepartures: { type: "Int", defaultValue: 5 }
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
});
