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
  getCityBikeNetworkId,
  CityBikeNetworkType,
} from '../util/citybikes';
import { isKeyboardSelectionEvent } from '../util/browser';

function BicycleLeg({ focusAction, index, leg }, { config }) {
  let stopsDescription;
  const distance = displayDistance(parseInt(leg.distance, 10), config);
  const duration = durationToString(leg.duration * 1000);
  let { mode } = leg;
  let legDescription = <span>{leg.from ? leg.from.name : ''}</span>;
  const firstLegClassName = index === 0 ? 'start' : '';
  let modeClassName = 'bicycle';

  const networkConfig =
    leg.rentedBike &&
    leg.from.bikeRentalStation &&
    getCityBikeNetworkConfig(
      getCityBikeNetworkId(leg.from.bikeRentalStation.networks),
      config,
    );
  const isScooter =
    networkConfig && networkConfig.type === CityBikeNetworkType.Scooter;

  if (leg.mode === 'WALK' || leg.mode === 'BICYCLE_WALK') {
    modeClassName = leg.mode.toLowerCase();
    stopsDescription = (
      <FormattedMessage
        id={
          isScooter
            ? 'scooterwalk-distance-duration'
            : 'cyclewalk-distance-duration'
        }
        values={{ distance, duration }}
        defaultMessage="Walk your bike {distance} ({duration})"
      />
    );
  } else {
    stopsDescription = (
      <FormattedMessage
        id={isScooter ? 'scooter-distance-duration' : 'cycle-distance-duration'}
        values={{ distance, duration }}
        defaultMessage="Cycle {distance} ({duration})"
      />
    );
  }

  let networkIcon;

  if (leg.rentedBike === true) {
    networkIcon = networkConfig && getCityBikeNetworkIcon(networkConfig);

    modeClassName = 'citybike';
    legDescription = (
      <FormattedMessage
        id={isScooter ? 'rent-scooter-at' : 'rent-cycle-at'}
        values={{ station: leg.from ? leg.from.name : '' }}
        defaultMessage="Rent a bike at {station} station"
      />
    );

    if (leg.mode === 'BICYCLE') {
      mode = 'CITYBIKE';
    }

    if (leg.mode === 'WALK') {
      mode = 'CITYBIKE_WALK';
    }
  }

  return (
    <div key={index} className="row itinerary-row">
      <span className="sr-only">
        {leg.rentedBike === true && legDescription}
        {(leg.mode === 'WALK' || leg.mode === 'BICYCLE_WALK') &&
          stopsDescription}
        <FormattedMessage
          id="itinerary-details.biking-leg"
          values={{
            time: moment(leg.startTime).format('HH:mm'),
            distance,
            origin: leg.from ? leg.from.name : '',
            destination: leg.to ? leg.to.name : '',
            duration,
          }}
        />
      </span>
      <div className="small-2 columns itinerary-time-column" aria-hidden="true">
        <div className="itinerary-time-column-time">
          {moment(leg.startTime).format('HH:mm')}
        </div>
        <RouteNumber
          mode={mode}
          vertical
          icon={networkIcon}
          {...getLegBadgeProps(leg, config)}
        />
      </div>
      <ItineraryCircleLine index={index} modeClassName={modeClassName} />
      <div
        onClick={focusAction}
        onKeyPress={e => isKeyboardSelectionEvent(e) && focusAction(e)}
        role="button"
        tabIndex="0"
        className={`small-9 columns itinerary-instruction-column ${firstLegClassName} ${mode.toLowerCase()}`}
      >
        <span className="sr-only">
          <FormattedMessage
            id="itinerary-summary.show-on-map"
            values={{ target: leg.from.name || '' }}
          />
        </span>
        <div className="itinerary-leg-first-row" aria-hidden="true">
          {legDescription}
          <Icon img="icon-icon_search-plus" className="itinerary-search-icon" />
        </div>
        <div className="itinerary-leg-action" aria-hidden="true">
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

const exampleLegScooter = t1 => ({
  duration: 120,
  startTime: t1 + 20000,
  distance: 586.4621425755712,
  from: {
    name: 'Ilmattarentie',
    bikeRentalStation: { bikesAvailable: 5, networks: ['samocat'] },
  },
  mode: 'BICYCLE',
  rentedBike: true,
});

const exampleLegScooterWalkingScooter = t1 => ({
  duration: 120,
  startTime: t1 + 20000,
  distance: 586.4621425755712,
  from: {
    name: 'Ilmattarentie',
    bikeRentalStation: { bikesAvailable: 5, networks: ['samocat'] },
  },
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
      <ComponentUsageExample description="bicycle-leg-scooter">
        <BicycleLeg
          leg={exampleLegScooter(today)}
          index={0}
          focusAction={() => {}}
        />
      </ComponentUsageExample>
      <ComponentUsageExample description="bicycle-leg-scooter-walking-scooter">
        <BicycleLeg
          leg={exampleLegScooterWalkingScooter(today)}
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
