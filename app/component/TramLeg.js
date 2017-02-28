import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import moment from 'moment';

import TransitLeg from './TransitLeg';
import ComponentUsageExample from './ComponentUsageExample';

const TramLeg = ({ leg, focusAction, index }) => (
  <TransitLeg
    mode="TRAM"
    leg={leg}
    focusAction={focusAction}
    index={index}
  >
    <FormattedMessage
      id="tram-with-route-number"
      values={{
        routeNumber: leg.route && leg.route.shortName,
        headSign: leg.trip && leg.trip.tripHeadsign,
      }} defaultMessage="Tram {routeNumber} {headSign}"
    /></TransitLeg>
);

const exampleLeg = t1 => ({
  realTime: false,
  transitLeg: true,
  startTime: t1 + 20000,
  endTime: t1 + 30000,
  departureDelay: 100,
  mode: 'TRAM',
  distance: 586.4621425755712,
  duration: 120,
  rentedBike: false,
  intermediateStops: [],
  route: { gtfsId: '123', shortName: '9', mode: 'TRAM' },
  trip: { tripHeadsign: 'Länsiterminaali T2', pattern: { code: '123' } },
  from: { name: 'Simonkatu', stop: { code: '0232' } },
});

TramLeg.description = () => {
  const today = moment().hour(12).minute(34).second(0)
                        .valueOf();
  return (
    <div>
      <p>Displays an itinerary tram leg.</p>
      <ComponentUsageExample>
        <TramLeg leg={exampleLeg(today)} index={1} focusAction={() => {}} />
      </ComponentUsageExample>
    </div>
  );
};

TramLeg.propTypes = {
  leg: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  focusAction: PropTypes.func.isRequired,
};

export default TramLeg;
