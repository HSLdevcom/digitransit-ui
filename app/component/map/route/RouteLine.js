import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';

import StopMarker from '../non-tile-layer/StopMarker';
import StopCardHeaderContainer from '../../StopCardHeaderContainer';
import LocationMarker from '../LocationMarker';
import Line from '../Line';

import { isBrowser } from '../../../util/browser';

function RouteLine(props) {
  if (!isBrowser || !props.pattern) {
    return false;
  }

  const objs = [];
  const modeClass = props.pattern.route.mode.toLowerCase();

  if (!props.thin) {
    // We are drawing a background line under an itinerary line,
    // so we don't want many markers cluttering the map
    objs.push(
      <LocationMarker
        key="from"
        position={props.pattern.stops[0]}
        className="from"
      />,
    );

    objs.push(
      <LocationMarker
        key="to"
        position={props.pattern.stops[props.pattern.stops.length - 1]}
        className="to"
      />,
    );
  }

  const filteredIds = props.filteredStops
    ? props.filteredStops.map(stop => stop.stopId)
    : [];

  const markers = props.pattern
    ? props.pattern.stops
        .filter(stop => !filteredIds.includes(stop.gtfsId))
        .map(stop => (
          <StopMarker
            stop={stop}
            key={stop.gtfsId}
            mode={modeClass + (props.thin ? ' thin' : '')}
            thin={props.thin}
          />
        ))
    : false;

  return (
    <div style={{ display: 'none' }}>
      {objs}
      <Line
        key="line"
        color={
          props.pattern.route.color ? `#${props.pattern.route.color}` : null
        }
        geometry={props.pattern.geometry || props.pattern.stops}
        mode={modeClass}
        thin={props.thin}
      />
      {markers}
    </div>
  );
}

RouteLine.propTypes = {
  pattern: PropTypes.shape({
    route: PropTypes.shape({
      mode: PropTypes.string.isRequired,
      color: PropTypes.string,
    }).isRequired,
    stops: PropTypes.arrayOf(
      PropTypes.shape({
        lat: PropTypes.number.isRequired,
        lon: PropTypes.number.isRequired,
      }).isRequired,
    ).isRequired,
    geometry: PropTypes.arrayOf(
      PropTypes.shape({
        lat: PropTypes.number.isRequired,
        lon: PropTypes.number.isRequired,
      }).isRequired,
    ),
  }).isRequired,
  thin: PropTypes.bool,
  filteredStops: PropTypes.arrayOf(PropTypes.string.isRequired),
};

RouteLine.defaultProps = {
  thin: false,
  filteredStops: [],
};

export default Relay.createContainer(RouteLine, {
  fragments: {
    pattern: () => Relay.QL`
      fragment on Pattern {
        geometry {
          lat
          lon
        }
        route {
          mode
          color
        }
        stops {
          lat
          lon
          name
          gtfsId
          platformCode
          ${StopCardHeaderContainer.getFragment('stop')}
        }
      }
    `,
  },
});
