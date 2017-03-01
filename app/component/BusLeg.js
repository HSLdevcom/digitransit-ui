import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import moment from 'moment';

import TransitLeg from './TransitLeg';
import ComponentUsageExample from './ComponentUsageExample';

const BusLeg = ({ leg, focusAction, index }) => (
  <TransitLeg
    mode="BUS"
    leg={leg}
    focusAction={focusAction}
    index={index}
  >
    <FormattedMessage
      id="bus-with-route-number"
      values={{
        routeNumber: leg.route && leg.route.shortName,
        headSign: leg.trip && leg.trip.tripHeadsign,
      }} defaultMessage="Bus {routeNumber} {headSign}"
    />
  </TransitLeg>
);

const exampleLeg = t1 => ({
  realTime: false,
  transitLeg: true,
  startTime: t1 + 20000,
  endTime: t1 + 30000,
  departureDelay: 100,
  mode: 'BUS',
  distance: 586.4621425755712,
  duration: 120,
  rentedBike: false,
  intermediateStops: [],
  route: { gtfsId: '123', shortName: '57', mode: 'BUS' },
  trip: { tripHeadsign: 'Kontula', pattern: { code: '1057' } },
  from: { name: 'Ilmattarentie', stop: { code: '2194' } },
});

const exampleLegRealtime = t1 => ({
  realTime: true,
  transitLeg: true,
  startTime: t1 + 20000,
  endTime: t1 + 30000,
  departureDelay: 100,
  mode: 'BUS',
  distance: 586.4621425755712,
  duration: 120,
  rentedBike: false,
  intermediateStops: [],
  route: { gtfsId: '123', shortName: '57', mode: 'BUS' },
  trip: { tripHeadsign: 'Kontula', pattern: { code: '1057' } },
  from: { name: 'Ilmattarentie', stop: { code: '2194' } },
});

BusLeg.description = () => {
  const today = moment().hour(12).minute(34).second(0)
                        .valueOf();
  return (
    <div>
      <p>Displays an itinerary bus leg.</p>
      <ComponentUsageExample description="scheduled">
        <BusLeg leg={exampleLeg(today)} index={1} focusAction={() => {}} />
      </ComponentUsageExample>
      <ComponentUsageExample description="realtime">
        <BusLeg leg={exampleLegRealtime(today)} index={1} focusAction={() => {}} />
      </ComponentUsageExample>
    </div>
  );
};

BusLeg.propTypes = {
  leg: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  focusAction: PropTypes.func.isRequired,
};

export default BusLeg;
