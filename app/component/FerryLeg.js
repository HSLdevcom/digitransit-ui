import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import moment from 'moment';

import TransitLeg from './TransitLeg';
import ComponentUsageExample from './ComponentUsageExample';

const FerryLeg = ({ leg, focusAction, index }) => (
  <TransitLeg
    mode="FERRY"
    leg={leg}
    focusAction={focusAction}
    index={index}
  >
    <FormattedMessage
      id="ferry-with-route-number"
      values={{
        routeNumber: leg.route && leg.route.shortName,
        headSign: leg.trip && leg.trip.tripHeadsign,
      }}
      defaultMessage="Ferry {routeNumber} {headSign}"
    /></TransitLeg>);

const exampleLeg = t1 => ({
  realTime: false,
  transitLeg: true,
  startTime: t1 + 20000,
  endTime: t1 + 30000,
  departureDelay: 100,
  mode: 'FERRY',
  distance: 586.4621425755712,
  duration: 900,
  rentedBike: false,
  intermediateStops: [],
  route: { gtfsId: '123', shortName: '19', mode: 'FERRY' },
  trip: { tripHeadsign: 'Suomenlinna, päälait', pattern: { code: '123' } },
  from: { name: 'Kauppatori', stop: { code: '0099' } },
});

FerryLeg.description = () => {
  const today = moment().hour(12).minute(34).second(0)
                        .valueOf();
  return (
    <div>
      <p>Displays an itinerary ferry leg.</p>
      <ComponentUsageExample>
        <FerryLeg leg={exampleLeg(today)} index={1} focusAction={() => {}} />
      </ComponentUsageExample>
    </div>
  );
};

FerryLeg.propTypes = {
  leg: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  focusAction: PropTypes.func.isRequired,
};
export default FerryLeg;
