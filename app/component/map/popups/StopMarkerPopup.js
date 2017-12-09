import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer } from 'react-relay/compat';
import { graphql } from 'relay-runtime';
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
  stop: graphql`
    fragment StopMarkerPopup_stop on Stop
      @argumentDefinitions(
        timeRange: { type: "Int", defaultValue: 43200 } # STOP_TIME_RANGE (12 * 60 * 60)
        numberOfDepartures: { type: "Int", defaultValue: 5 } # NUMBER_OF_DEPARTURES
      ) {
      gtfsId
      lat
      lon
      name
      ...StopCardContainer_stop
        @arguments(
          startTime: $currentTime
          timeRange: $timeRange
          numberOfDepartures: $numberOfDepartures
        )
    }
  `,
  terminal: graphql`
    fragment StopMarkerPopup_terminal on Stop
      @argumentDefinitions(
        timeRange: { type: "Int", defaultValue: 3600 } # TERMINAL_TIME_RANGE (60 * 60)
        # Terminals do not show arrivals, so we need some slack
        numberOfDepartures: { type: "Int", defaultValue: 15 } # NUMBER_OF_DEPARTURES * 3
      ) {
      gtfsId
      lat
      lon
      name
      ...StopCardContainer_stop
        @arguments(
          startTime: $currentTime
          timeRange: $timeRange
          numberOfDepartures: $numberOfDepartures
        )
    }
  `,
});
