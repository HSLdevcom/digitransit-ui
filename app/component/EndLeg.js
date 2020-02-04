import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';

import { FormattedMessage } from 'react-intl';
import Icon from './Icon';
import ComponentUsageExample from './ComponentUsageExample';
import { isKeyboardSelectionEvent } from '../util/browser';

/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
function EndLeg(props) {
  const modeClassName = 'end';
  return (
    <div key={props.index} className="row itinerary-row">
      <span className="sr-only">
        <FormattedMessage
          id="itinerary-details.end-leg"
          values={{
            time: moment(props.endTime).format('HH:mm'),
            destination: props.to,
          }}
        />
      </span>
      <div className="small-2 columns itinerary-time-column" aria-hidden="true">
        <div className="itinerary-time-column-time">
          {moment(props.endTime).format('HH:mm')}
        </div>
      </div>
      <div className={`leg-before ${modeClassName}`} aria-hidden="true">
        <div className={`leg-before-circle circle ${modeClassName}`} />
        <div className="itinerary-icon-container">
          <Icon
            img="icon-icon_mapMarker-to"
            className="itinerary-icon to to-it"
          />
        </div>
      </div>
      <div
        onClick={props.focusAction}
        onKeyPress={e => isKeyboardSelectionEvent(e) && props.focusAction(e)}
        role="button"
        tabIndex="0"
        className="small-9 columns itinerary-instruction-column to end"
      >
        <span className="sr-only">
          <FormattedMessage
            id="itinerary-summary.show-on-map"
            values={{ target: props.to || '' }}
          />
        </span>
        <div className="itinerary-leg-first-row" aria-hidden="true">
          <div>{props.to}</div>
          <Icon img="icon-icon_search-plus" className="itinerary-search-icon" />
        </div>
      </div>
    </div>
  );
}

EndLeg.description = () => {
  const endTime = moment()
    .hour(12)
    .minute(34)
    .second(0)
    .valueOf();
  return (
    <div>
      <p>Displays an itinerary end leg.</p>
      <ComponentUsageExample>
        <EndLeg
          endTime={endTime}
          to="Veturitie"
          index={3}
          focusAction={() => {}}
        />
      </ComponentUsageExample>
    </div>
  );
};

EndLeg.propTypes = {
  endTime: PropTypes.number.isRequired,
  to: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  focusAction: PropTypes.func.isRequired,
};

export default EndLeg;
