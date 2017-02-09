import React from 'react';
import { FormattedMessage } from 'react-intl';
import moment from 'moment';
import RouteNumber from './RouteNumber';
import Icon from './Icon';

function AirportCollectLuggageLeg(props) {
  return (
    <div style={{ width: '100%' }} className="row itinerary-row" >
      <div className="small-2 columns itinerary-time-column">
        <div className="itinerary-time-column-time">
          {moment(props.leg.endTime).format('HH:mm')}
        </div>
        <RouteNumber mode="wait" vertical />
      </div>
      <div
        onClick={props.focusAction}
        className="small-10 columns itinerary-instruction-column wait"
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

AirportCollectLuggageLeg.propTypes = {
  leg: React.PropTypes.shape({
    endTime: React.PropTypes.number.isRequired,
  }).isRequired,
  focusAction: React.PropTypes.func.isRequired,
};

export default AirportCollectLuggageLeg;
