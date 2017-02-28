import React from 'react';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';
import RouteNumber from './RouteNumber';
import Icon from './Icon';
import ComponentUsageExample from './ComponentUsageExample';

import { displayDistance } from '../util/geo-utils';
import { durationToString } from '../util/timeUtils';

function BicycleLeg(props) {
  let stopsDescription;
  const distance = displayDistance(parseInt(props.leg.distance, 10));
  const duration = durationToString(props.leg.duration * 1000);
  let { mode } = props.leg;
  let legDescription = <span>{props.leg.from.name}</span>;
  const firstLegClassName = props.index === 0 ? 'start' : '';

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
        className={`small-10 columns itinerary-instruction-column ${firstLegClassName} ${mode.toLowerCase()}`}
      >
        <div className="itinerary-leg-first-row">
          {props.index === 0 && (
            <div><Icon img="icon-icon_mapMarker-point" className="itinerary-icon from" /></div>
          )}
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

const exampleLeg = t1 => ({
  duration: 120,
  startTime: t1 + 20000,
  distance: 586.4621425755712,
  from: { name: 'Ilmattarentie' },
  mode: 'BICYCLE',
  rentedBike: false,
});

const exampleLegWalkingBike = t1 => ({
  duration: 120,
  startTime: t1 + 20000,
  distance: 586.4621425755712,
  from: { name: 'Ilmattarentie' },
  mode: 'BICYCLE_WALK',
  rentedBike: false,
});

const exampleLegCitybike = t1 => ({
  duration: 120,
  startTime: t1 + 20000,
  distance: 586.4621425755712,
  from: { name: 'Ilmattarentie' },
  mode: 'BICYCLE',
  rentedBike: true,
});

const exampleLegCitybikeWalkingBike = t1 => ({
  duration: 120,
  startTime: t1 + 20000,
  distance: 586.4621425755712,
  from: { name: 'Ilmattarentie' },
  mode: 'WALK',
  rentedBike: true,
});

BicycleLeg.description = () => {
  const today = moment().hour(12).minute(34).second(0)
                        .valueOf();
  return (
    <div>
      <p>Displays an itinerary bicycle leg.</p>
      <ComponentUsageExample description="bicycle-leg-normal">
        <BicycleLeg leg={exampleLeg(today)} index={0} focusAction={() => {}} />
      </ComponentUsageExample>
      <ComponentUsageExample description="bicycle-leg-walking-bike">
        <BicycleLeg leg={exampleLegWalkingBike(today)} index={0} focusAction={() => {}} />
      </ComponentUsageExample>
      <ComponentUsageExample description="bicycle-leg-citybike">
        <BicycleLeg leg={exampleLegCitybike(today)} index={0} focusAction={() => {}} />
      </ComponentUsageExample>
      <ComponentUsageExample description="bicycle-leg-citybike-walking-bike">
        <BicycleLeg leg={exampleLegCitybikeWalkingBike(today)} index={1} focusAction={() => {}} />
      </ComponentUsageExample>
    </div>
  );
};

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
