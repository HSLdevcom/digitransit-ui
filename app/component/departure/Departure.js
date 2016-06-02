import React from 'react';
import cx from 'classnames';
import RouteNumber from './RouteNumber';
import RouteDestination from './route-destination';
import DepartureTime from './DepartureTime';
import StopReference from '../stop/stop-reference';
import ComponentUsageExample from '../documentation/ComponentUsageExample';
import {
  currentTime as exampleCurrentTime,
  departure as exampleDeparture,
  realtimeDeparture as exampleRealtimeDeparture,
} from '../documentation/ExampleData';

function Departure(props) {
  const mode = props.departure.pattern.route.type.toLowerCase();

  let stopReference = <span />;
  if (props.showStop) {
    stopReference = <StopReference mode={mode} code={props.departure.stop.code} />;
  }

  return (
    <p className={cx('departure', 'route-detail-text', props.className)}>
      <DepartureTime
        departureTime={props.departure.stoptime}
        realtime={props.departure.realtime}
        currentTime={props.currentTime}
        canceled={props.canceled}
        useUTC={props.useUTC}
      />
      <RouteNumber
        mode={mode}
        realtime={props.departure.realtime}
        text={props.departure.pattern.route.shortName}
      />
      <RouteDestination
        mode={mode}
        destination={props.departure.pattern.headsign ||
                     props.departure.pattern.route.longName}
      />
      {stopReference}
    </p>);
}

Departure.description = (
  <div>
    <p>
      Display a departure row using react components
    </p>
    <ComponentUsageExample>
      <Departure
        departure={exampleRealtimeDeparture}
        currentTime={exampleCurrentTime}
        useUTC
      />
    </ComponentUsageExample>
    <ComponentUsageExample
      description="adding padding classes"
    >
      <Departure
        departure={exampleDeparture}
        currentTime={exampleCurrentTime}
        className="padding-normal padding-bottom"
        useUTC
      />
    </ComponentUsageExample>
    <ComponentUsageExample
      description="with stop number"
    >
      <Departure
        departure={exampleDeparture}
        currentTime={exampleCurrentTime}
        className="padding-normal padding-bottom"
        showStop
        useUTC
      />
    </ComponentUsageExample>
  </div>);

Departure.propTypes = {
  canceled: React.PropTypes.bool,
  className: React.PropTypes.string,
  currentTime: React.PropTypes.number.isRequired,
  departure: React.PropTypes.object.isRequired,
  showStop: React.PropTypes.bool,
  useUTC: React.PropTypes.bool,
};

export default Departure;
