import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import moment from 'moment';

import TransitLeg from './TransitLeg';
import ComponentUsageExample from './ComponentUsageExample';

const SubwayLeg = ({ leg, focusAction, index }) => (
  <TransitLeg mode="SUBWAY" leg={leg} focusAction={focusAction} index={index}>
    <FormattedMessage
      id="subway-with-route-number"
      values={{
        routeNumber: leg.route && leg.route.shortName,
        headSign: leg.trip && leg.trip.tripHeadsign,
      }}
      defaultMessage="Metro {routeNumber} {headSign}"
    />
  </TransitLeg>
);

const exampleLeg = t1 => ({
  realTime: false,
  transitLeg: true,
  startTime: t1 + 20000,
  endTime: t1 + 30000,
  departureDelay: 100,
  mode: 'SUBWAY',
  distance: 586.4621425755712,
  duration: 120,
  rentedBike: false,
  intermediatePlaces: [],
  route: { gtfsId: '123', shortName: 'M2', mode: 'SUBWAY' },
  trip: { gtfsId: '123', tripHeadsign: 'Tapiola', pattern: { code: '123' } },
  from: { name: 'Mellunmäki', stop: { code: 'M2' } },
  to: { name: 'Tapiola', stop: { code: '1234 ' } },
});

SubwayLeg.description = () => {
  const today = moment()
    .hour(12)
    .minute(34)
    .second(0)
    .valueOf();
  return (
    <div>
      <p>Displays an itinerary subway leg.</p>
      <ComponentUsageExample>
        <SubwayLeg leg={exampleLeg(today)} index={1} focusAction={() => {}} />
      </ComponentUsageExample>
    </div>
  );
};

SubwayLeg.propTypes = {
  leg: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  focusAction: PropTypes.func.isRequired,
};

export default SubwayLeg;
