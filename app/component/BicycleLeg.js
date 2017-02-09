import React from 'react';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';
import RouteNumber from './RouteNumber';
import Icon from './Icon';

import { displayDistance } from '../util/geo-utils';
import { durationToString } from '../util/timeUtils';

function BicycleLeg(props) {
  let stopsDescription;
  const distance = displayDistance(parseInt(props.leg.distance, 10));
  const duration = durationToString(props.leg.duration * 1000);
  let { mode } = props.leg;
  let legDescription = <span>{props.leg.from.name}</span>;

  if (props.leg.mode === 'WALK' || props.leg.mode === 'BICYCLE_WALK') {
    stopsDescription = (
      <FormattedMessage
        id="cyclewalk-distance-duration"
        values={{ distance, duration }}
        defaultMessage="Walk your bike {distance} ({duration})"
      />
    );
  } else {
    stopsDescription = (
      <FormattedMessage
        id="cycle-distance-duration"
        values={{ distance, duration }}
        defaultMessage="Cycle {distance} ({duration})"
      />
    );
  }

  if (props.leg.rentedBike === true) {
    legDescription = (
      <FormattedMessage
        id="rent-cycle-at"
        values={{ station: props.leg.from.name }}
        defaultMessage="Rent a bike at {station} station"
      />
    );

    if (props.leg.mode === 'BICYCLE') {
      mode = 'CITYBIKE';
    }

    if (props.leg.mode === 'WALK') {
      mode = 'CITYBIKE_WALK';
    }
  }

  return (
    <div key={props.index} style={{ width: '100%' }} className="row itinerary-row">
      <div className="small-2 columns itinerary-time-column">
        <div className="itinerary-time-column-time">
          {moment(props.leg.startTime).format('HH:mm')}
        </div>
        <RouteNumber mode={mode} vertical />
      </div>
      <div
        onClick={props.focusAction}
        className={`small-10 columns itinerary-instruction-column ${mode.toLowerCase()}`}
      >
        <div className="itinerary-leg-first-row">
          {legDescription}
          <Icon img="icon-icon_search-plus" className="itinerary-search-icon" />
        </div>
        <div>
          {stopsDescription}
        </div>
      </div>
    </div>
  );
}

BicycleLeg.propTypes = {
  leg: React.PropTypes.shape({
    duration: React.PropTypes.number.isRequired,
    startTime: React.PropTypes.number.isRequired,
    distance: React.PropTypes.number.isRequired,
    from: React.PropTypes.shape({
      name: React.PropTypes.string.isRequired,
    }).isRequired,
    mode: React.PropTypes.string.isRequired,
    rentedBike: React.PropTypes.bool.isRequired,
  }).isRequired,
  index: React.PropTypes.number.isRequired,
  focusAction: React.PropTypes.func.isRequired,
};

export default BicycleLeg;
