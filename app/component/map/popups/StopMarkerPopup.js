import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
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
        startTime={props.relay.variables.currentTime}
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
  relay: PropTypes.shape({
    variables: PropTypes.shape({
      currentTime: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
};

export default Relay.createContainer(StopMarkerPopup, {
  fragments: {
    stop: ({ currentTime }) => Relay.QL`
      fragment on Stop{
        gtfsId
        lat
        lon
        name
        ${StopCardContainer.getFragment('stop', {
          startTime: currentTime,
          timeRange: STOP_TIME_RANGE,
          numberOfDepartures: NUMBER_OF_DEPARTURES,
        })}
      }
    `,
    terminal: ({ currentTime }) => Relay.QL`
      fragment on Stop{
        gtfsId
        lat
        lon
        name
        ${StopCardContainer.getFragment('stop', {
          startTime: currentTime,
          timeRange: TERMINAL_TIME_RANGE,
          // Terminals do not show arrivals, so we need some slack
          numberOfDepartures: NUMBER_OF_DEPARTURES * 3,
        })}
      }
    `,
  },
  initialVariables: {
    currentTime: 0,
  },
});
