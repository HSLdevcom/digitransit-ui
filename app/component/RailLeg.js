import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import moment from 'moment';

import TransitLeg from './TransitLeg';
import ComponentUsageExample from './ComponentUsageExample';

const RailLeg = ({ leg, focusAction, index }) => (
  <TransitLeg
    mode="RAIL"
    leg={leg}
    focusAction={focusAction}
    index={index}
  ><FormattedMessage
    id="train-with-route-number"
    values={{
      routeNumber: leg.route && leg.route.shortName,
      headSign: leg.trip && leg.trip.tripHeadsign,
    }}
    defaultMessage="Train {routeNumber} {headSign}"
  /></TransitLeg>
);

const exampleLeg = t1 => ({
  realTime: false,
  transitLeg: true,
  startTime: t1 + 20000,
  endTime: t1 + 30000,
  departureDelay: 100,
  mode: 'RAIL',
  distance: 586.4621425755712,
  duration: 120,
  rentedBike: false,
  intermediateStops: [],
  route: { gtfsId: '123', shortName: 'P', mode: 'RAIL' },
  trip: { tripHeadsign: 'Helsinki', pattern: { code: '123' } },
  from: { name: 'Käpylä', stop: { code: '0072' } },
});

RailLeg.description = () => {
  const today = moment().hour(12).minute(34).second(0)
                        .valueOf();
  return (
    <div>
      <p>Displays an itinerary rail leg.</p>
      <ComponentUsageExample>
        <RailLeg leg={exampleLeg(today)} index={1} focusAction={() => {}} />
      </ComponentUsageExample>
    </div>
  );
};

RailLeg.propTypes = {
  leg: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  focusAction: PropTypes.func.isRequired,
};

export default RailLeg;
