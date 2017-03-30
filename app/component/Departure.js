import React from 'react';
import cx from 'classnames';
import RouteNumberContainer from './RouteNumberContainer';
import RouteDestination from './RouteDestination';
import DepartureTime from './DepartureTime';
import PlatformNumber from './PlatformNumber';
import ComponentUsageExample from './ComponentUsageExample';
import { isCallAgencyDeparture } from '../util/legUtils';
import {
  currentTime as exampleCurrentTime,
  departure as exampleDeparture,
  realtimeDeparture as exampleRealtimeDeparture,
} from './ExampleData';

function Departure(props) {
  const mode = props.departure.pattern.route.mode.toLowerCase();

  let platformNumber = false;
  if (props.isTerminal) {
    platformNumber = <PlatformNumber number={props.departure.stop.platformCode} />;
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
      <RouteNumberContainer
        route={props.departure.pattern.route}
        isCallAgency={isCallAgencyDeparture(props.departure)}
        fadeLong
      />
      <RouteDestination
        mode={mode}
        destination={props.departure.headsign ||
                     props.departure.pattern.headsign ||
                     props.departure.pattern.route.longName}
        isArrival={props.isArrival}
      />
      {platformNumber}
    </p>);
}

Departure.description = () =>
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
      description="with platform number"
    >
      <Departure
        departure={exampleDeparture}
        currentTime={exampleCurrentTime}
        className="padding-normal padding-bottom"
        isTerminal
        useUTC
      />
    </ComponentUsageExample>
    <ComponentUsageExample
      description="isArrival true"
    >
      <Departure
        departure={exampleDeparture}
        currentTime={exampleCurrentTime}
        className="padding-normal padding-bottom"
        useUTC
        isArrival
      />
    </ComponentUsageExample>
  </div>;

Departure.displayName = 'Departure';

Departure.propTypes = {
  canceled: React.PropTypes.bool,
  className: React.PropTypes.string,
  currentTime: React.PropTypes.number.isRequired,
  departure: React.PropTypes.object.isRequired,
  isArrival: React.PropTypes.bool,
  isTerminal: React.PropTypes.bool,
  useUTC: React.PropTypes.bool,
};

export default Departure;
