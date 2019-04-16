import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';
import RouteNumber from './RouteNumber';
import Icon from './Icon';
import ComponentUsageExample from './ComponentUsageExample';

import { displayDistance } from '../util/geo-utils';
import { durationToString } from '../util/timeUtils';
import ItineraryCircleLine from './ItineraryCircleLine';
import { getLegBadgeProps } from '../util/legUtils';
import {
  getCityBikeNetworkIcon,
  getCityBikeNetworkConfig,
} from '../util/citybikes';

function BicycleLeg(props, context) {
  let stopsDescription;
  const distance = displayDistance(
    parseInt(props.leg.distance, 10),
    context.config,
  );
  const duration = durationToString(props.leg.duration * 1000);
  let { mode } = props.leg;
  let legDescription = <span>{props.leg.from.name}</span>;
  const firstLegClassName = props.index === 0 ? 'start' : '';
  let modeClassName = 'bicycle';

  if (props.leg.mode === 'WALK' || props.leg.mode === 'BICYCLE_WALK') {
    modeClassName = props.leg.mode.toLowerCase();
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
    modeClassName = 'citybike';
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

  const networkIcon = getCityBikeNetworkIcon(
    getCityBikeNetworkConfig(
      props.leg.from.bikeRentalStation.networks[0],
      context.config,
    ),
  );

  /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
  return (
    <div key={props.index} className="row itinerary-row">
      <div className="small-2 columns itinerary-time-column">
        <div className="itinerary-time-column-time">
          {moment(props.leg.startTime).format('HH:mm')}
        </div>
        <RouteNumber
          mode={mode}
          vertical
          hasNetwork={networkIcon}
          {...getLegBadgeProps(props.leg, context.config)}
        />
      </div>
      <ItineraryCircleLine index={props.index} modeClassName={modeClassName} />
      <div
        onClick={props.focusAction}
        className={`small-9 columns itinerary-instruction-column ${firstLegClassName} ${mode.toLowerCase()}`}
      >
        <div className="itinerary-leg-first-row">
          {legDescription}
          <Icon img="icon-icon_search-plus" className="itinerary-search-icon" />
        </div>
        <div className="itinerary-leg-action">{stopsDescription}</div>
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
  const today = moment()
    .hour(12)
    .minute(34)
    .second(0)
    .valueOf();
  return (
    <div>
      <p>Displays an itinerary bicycle leg.</p>
      <ComponentUsageExample description="bicycle-leg-normal">
        <BicycleLeg leg={exampleLeg(today)} index={0} focusAction={() => {}} />
      </ComponentUsageExample>
      <ComponentUsageExample description="bicycle-leg-walking-bike">
        <BicycleLeg
          leg={exampleLegWalkingBike(today)}
          index={0}
          focusAction={() => {}}
        />
      </ComponentUsageExample>
      <ComponentUsageExample description="bicycle-leg-citybike">
        <BicycleLeg
          leg={exampleLegCitybike(today)}
          index={0}
          focusAction={() => {}}
        />
      </ComponentUsageExample>
      <ComponentUsageExample description="bicycle-leg-citybike-walking-bike">
        <BicycleLeg
          leg={exampleLegCitybikeWalkingBike(today)}
          index={1}
          focusAction={() => {}}
        />
      </ComponentUsageExample>
    </div>
  );
};

BicycleLeg.propTypes = {
  leg: PropTypes.shape({
    duration: PropTypes.number.isRequired,
    startTime: PropTypes.number.isRequired,
    distance: PropTypes.number.isRequired,
    from: PropTypes.shape({
      name: PropTypes.string.isRequired,
      bikeRentalStation: PropTypes.shape({
        bikesAvailable: PropTypes.number.isRequired,
        networks: PropTypes.array.isRequired,
      }),
    }).isRequired,
    mode: PropTypes.string.isRequired,
    rentedBike: PropTypes.bool.isRequired,
  }).isRequired,
  index: PropTypes.number.isRequired,
  focusAction: PropTypes.func.isRequired,
};

BicycleLeg.contextTypes = { config: PropTypes.object.isRequired };

export default BicycleLeg;
