import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import { FormattedMessage, intlShape } from 'react-intl';

import DepartureTime from './DepartureTime';
import Icon from './Icon';
import RouteNumberContainer from './RouteNumberContainer';
import RouteDestination from './RouteDestination';
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
  if (props.showPlatformCode && props.departure.stop.platformCode) {
    platformNumber = (
      <PlatformNumber number={props.departure.stop.platformCode} />
    );
  }

  return (
    <p className={cx('departure', 'route-detail-text', props.className)}>
      {!props.staticDeparture && (
        <DepartureTime
          departureTime={props.departure.stoptime}
          realtime={props.departure.realtime}
          currentTime={props.currentTime}
          canceled={props.canceled}
          useUTC={props.useUTC}
        />
      )}
      <RouteNumberContainer
        route={props.departure.pattern.route}
        hasDisruption={props.hasDisruption}
        isCallAgency={isCallAgencyDeparture(props.departure)}
        fadeLong
      />
      <RouteDestination
        mode={mode}
        destination={
          props.departure.headsign ||
          props.departure.pattern.headsign ||
          props.departure.trip.tripHeadsign ||
          props.departure.pattern.route.longName
        }
        isArrival={props.isArrival}
        isLastStop={props.isLastStop}
      />
      {props.canceled ? (
        <div className="departure-canceled">
          <Icon img="icon-icon_caution" />
          <FormattedMessage id="canceled" defaultMessage="Canceled" />
        </div>
      ) : (
        platformNumber
      )}
    </p>
  );
}

Departure.description = () => (
  <div>
    <p>Display a departure row using react components</p>
    <ComponentUsageExample>
      <Departure
        departure={exampleRealtimeDeparture}
        currentTime={exampleCurrentTime}
        useUTC
      />
    </ComponentUsageExample>
    <ComponentUsageExample description="adding padding classes">
      <Departure
        departure={exampleDeparture}
        currentTime={exampleCurrentTime}
        className="padding-normal padding-bottom"
        useUTC
      />
    </ComponentUsageExample>
    <ComponentUsageExample description="with platform number">
      <Departure
        departure={exampleDeparture}
        currentTime={exampleCurrentTime}
        className="padding-normal padding-bottom desktop"
        showPlatformCode
        useUTC
      />
    </ComponentUsageExample>
    <ComponentUsageExample description="drop-off only">
      <Departure
        departure={exampleDeparture}
        currentTime={exampleCurrentTime}
        className="padding-normal padding-bottom"
        useUTC
        isArrival
      />
    </ComponentUsageExample>
    <ComponentUsageExample description="last stop">
      <Departure
        departure={exampleDeparture}
        currentTime={exampleCurrentTime}
        className="padding-normal padding-bottom"
        useUTC
        isArrival
        isLastStop
      />
    </ComponentUsageExample>
  </div>
);

Departure.displayName = 'Departure';

Departure.propTypes = {
  canceled: PropTypes.bool,
  className: PropTypes.string,
  hasDisruption: PropTypes.bool,
  currentTime: PropTypes.number.isRequired,
  departure: PropTypes.shape({
    headsign: PropTypes.string,
    pattern: PropTypes.shape({
      headsign: PropTypes.string,
      route: PropTypes.shape({
        longName: PropTypes.string,
        mode: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
    realtime: PropTypes.bool,
    stop: PropTypes.shape({
      platformCode: PropTypes.string,
    }),
    stoptime: PropTypes.number.isRequired,
    trip: PropTypes.object,
  }).isRequired,
  isArrival: PropTypes.bool,
  isLastStop: PropTypes.bool,
  showPlatformCode: PropTypes.bool,
  useUTC: PropTypes.bool,
  staticDeparture: PropTypes.bool,
};

Departure.defaultProps = {
  showPlatformCode: false,
};

Departure.contextTypes = {
  config: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
};

export default Departure;
