import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import moment from 'moment';

import TransitLeg from './TransitLeg';
import ComponentUsageExample from './ComponentUsageExample';

const AirplaneLeg = ({ leg, focusAction, index }) => (
  <TransitLeg
    mode="AIRPLANE"
    leg={leg}
    focusAction={focusAction}
    index={index}
  >
    <FormattedMessage
      id="airplane-with-route-number"
      values={{
        routeNumber: leg.route && leg.route.shortName,
      }}
      defaultMessage="Flight {routeNumber}"
    />
  </TransitLeg>
);

AirplaneLeg.propTypes = {
  leg: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  focusAction: PropTypes.func.isRequired,
};

const exampleLeg = t1 => ({
  realTime: false,
  transitLeg: true,
  startTime: t1 + 20000,
  endTime: t1 + 30000,
  departureDelay: 100,
  mode: 'AIRPLANE',
  distance: 586.4621425755712,
  duration: 120,
  rentedBike: false,
  intermediateStops: [],
  route: { gtfsId: '123', shortName: 'AY447', mode: 'AIRPLANE' },
  trip: { tripHeadsign: 'Kittila', pattern: { code: 'AY447' } },
  from: { name: 'Helsingin lentoasema', stop: { code: 'HEL' } },
});

AirplaneLeg.description = () => {
  const today = moment().hour(12).minute(34).second(0)
                        .valueOf();
  return (
    <div>
      <p>Displays an itinerary airplane leg.</p>
      <ComponentUsageExample>
        <AirplaneLeg leg={exampleLeg(today)} index={1} focusAction={() => {}} />
      </ComponentUsageExample>
    </div>
  );
};

export default AirplaneLeg;
