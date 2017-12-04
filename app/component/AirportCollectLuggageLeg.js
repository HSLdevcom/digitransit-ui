import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import moment from 'moment';
import RouteNumber from './RouteNumber';
import Icon from './Icon';
import ComponentUsageExample from './ComponentUsageExample';
import ItineraryCircleLine from './ItineraryCircleLine';

/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
function AirportCollectLuggageLeg(props) {
  const modeClassName = 'wait';
  return (
    <div className="row itinerary-row">
      <div className="small-2 columns itinerary-time-column">
        <div className="itinerary-time-column-time">
          {moment(props.leg.endTime).format('HH:mm')}
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
            id="airport-collect-luggage"
            defaultMessage="Collect your luggage"
          />
          <Icon img="icon-icon_search-plus" className="itinerary-search-icon" />
        </div>
      </div>
    </div>
  );
}

const exampleLeg = t1 => ({
  endTime: t1 + 100000,
});

AirportCollectLuggageLeg.description = () => {
  const today = moment()
    .hour(12)
    .minute(34)
    .second(0)
    .valueOf();
  return (
    <div>
      <p>Displays an itinerary airport collect luggage leg.</p>
      <ComponentUsageExample>
        <AirportCollectLuggageLeg
          leg={exampleLeg(today)}
          focusAction={() => {}}
        />
      </ComponentUsageExample>
    </div>
  );
};

AirportCollectLuggageLeg.propTypes = {
  index: PropTypes.number.isRequired,
  leg: PropTypes.shape({
    endTime: PropTypes.number.isRequired,
  }).isRequired,
  focusAction: PropTypes.func.isRequired,
};

export default AirportCollectLuggageLeg;
