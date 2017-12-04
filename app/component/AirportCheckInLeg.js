import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import moment from 'moment';
import RouteNumber from './RouteNumber';
import Icon from './Icon';
import ComponentUsageExample from './ComponentUsageExample';
import ItineraryCircleLine from './ItineraryCircleLine';

/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
function AirportCheckInLeg(props) {
  const modeClassName = 'wait';
  return (
    <div className="row itinerary-row">
      <div className="small-2 columns itinerary-time-column">
        <div className="itinerary-time-column-time">
          {moment(props.startTime).format('HH:mm')}
        </div>
        <RouteNumber mode="wait" vertical />
      </div>
      <ItineraryCircleLine index={props.index} modeClassName={modeClassName} />
      <div
        onClick={props.focusAction}
        className="small-9 columns itinerary-instruction-column wait"
      >
        <div className="itinerary-leg-first-row">
          <FormattedMessage
            id="airport-check-in"
            values={{ agency: props.leg.agency && props.leg.agency.name }}
            defaultMessage="Check-in at the {agency} desk"
          />
          <Icon img="icon-icon_search-plus" className="itinerary-search-icon" />
        </div>
        <div>
          <FormattedMessage
            id="airport-security-check-go-to-gate"
            defaultMessage="Proceed to your gate through security check"
          />
        </div>
      </div>
    </div>
  );
}

const exampleLeg = () => ({
  agency: { name: 'Finnair' },
});

AirportCheckInLeg.description = () => {
  const startTime = moment()
    .hour(12)
    .minute(34)
    .second(0)
    .valueOf();
  return (
    <div>
      <p>Displays an itinerary airport check-in leg.</p>
      <ComponentUsageExample>
        <AirportCheckInLeg
          leg={exampleLeg()}
          startTime={startTime}
          focusAction={() => {}}
        />
      </ComponentUsageExample>
    </div>
  );
};

AirportCheckInLeg.propTypes = {
  leg: PropTypes.shape({
    agency: PropTypes.shape({
      name: PropTypes.string,
    }),
  }).isRequired,
  startTime: PropTypes.number.isRequired,
  focusAction: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
};

export default AirportCheckInLeg;
