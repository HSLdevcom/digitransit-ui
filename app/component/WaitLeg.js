import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';

import RouteNumber from './RouteNumber';
import ComponentUsageExample from './ComponentUsageExample';
import Icon from './Icon';
import { durationToString } from '../util/timeUtils';
import ItineraryCircleLine from './ItineraryCircleLine';
import { isKeyboardSelectionEvent } from '../util/browser';

/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
function WaitLeg(props) {
  const modeClassName = 'wait';
  return (
    <div className="row itinerary-row">
      <span className="sr-only">
        <FormattedMessage
          id="wait-amount-of-time"
          values={{
            duration: durationToString(props.waitTime),
          }}
        />
      </span>
      <div className="small-2 columns itinerary-time-column" aria-hidden="true">
        <div className="itinerary-time-column-time">
          {moment(props.startTime).format('HH:mm')}
        </div>
        <RouteNumber mode="wait" vertical />
      </div>
      <ItineraryCircleLine modeClassName={modeClassName} index={props.index} />
      <div
        onClick={props.focusAction}
        onKeyPress={e => isKeyboardSelectionEvent(e) && props.focusAction(e)}
        role="button"
        tabIndex="0"
        className="small-9 columns itinerary-instruction-column wait"
      >
        <span className="sr-only">
          <FormattedMessage
            id="itinerary-summary.show-on-map"
            values={{ target: props.leg.to.name || '' }}
          />
        </span>
        <div className="itinerary-leg-first-row" aria-hidden="true">
          <div>
            {props.leg.to.name}
            {props.children}
          </div>
          <Icon img="icon-icon_search-plus" className="itinerary-search-icon" />
        </div>
        <div className="itinerary-leg-action" aria-hidden="true">
          <FormattedMessage
            id="wait-amount-of-time"
            values={{ duration: `(${durationToString(props.waitTime)})` }}
            defaultMessage="Wait {duration}"
          />
        </div>
      </div>
    </div>
  );
}

const exampleLeg = () => ({
  to: { name: 'Ilmattarentie' },
});

WaitLeg.description = () => {
  const today = moment()
    .hour(12)
    .minute(34)
    .second(0)
    .valueOf();
  const leg = exampleLeg();
  const duration = moment.duration(17, 'minutes').asMilliseconds();
  return (
    <div>
      <p>Displays an itinerary wait leg.</p>
      <ComponentUsageExample>
        <WaitLeg
          startTime={today}
          focusAction={() => {}}
          waitTime={duration}
          leg={leg}
        />
      </ComponentUsageExample>
    </div>
  );
};

WaitLeg.propTypes = {
  startTime: PropTypes.number.isRequired,
  focusAction: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  children: PropTypes.node,
  waitTime: PropTypes.number.isRequired,
  leg: PropTypes.shape({
    to: PropTypes.shape({
      name: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default WaitLeg;
