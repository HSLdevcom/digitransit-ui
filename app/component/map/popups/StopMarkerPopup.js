import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import StopCardContainer from '../../StopCardContainer';
import MarkerPopupBottom from '../MarkerPopupBottom';

const NUMBER_OF_DEPARTURES = 5;
const STOP_TIME_RANGE = 12 * 60 * 60;
const TERMINAL_TIME_RANGE = 60 * 60;

function StopMarkerPopup(props) {
  const stop = props.stop || props.terminal;
  const terminal = props.terminal !== null;

  return (
    <div className="card">
      <StopCardContainer
        stop={stop}
        numberOfDepartures={(terminal ? 3 : 1) * NUMBER_OF_DEPARTURES}
        startTime={props.currentTime}
        isTerminal={terminal}
        timeRange={terminal ? TERMINAL_TIME_RANGE : STOP_TIME_RANGE}
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
      @argumentDefinitions(startTime: { type: "Long", defaultValue: 123 }) {
      gtfsId
      lat
      lon
      name
      ...StopCardContainer_stop @arguments(startTime: $startTime)
    }
  `,
  terminal: graphql.experimental`
    fragment StopMarkerPopup_terminal on Stop
      @argumentDefinitions(startTime: { type: "Long", defaultValue: 123 }) {
      gtfsId
      lat
      lon
      name
      ...StopCardContainer_stop @arguments(startTime: $startTime)
    }
  `,
});
