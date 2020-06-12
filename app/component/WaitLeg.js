import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';

import RouteNumber from './RouteNumber';
import PlatformNumber from './PlatformNumber';
import ComponentUsageExample from './ComponentUsageExample';
import Icon from './Icon';
import { durationToString } from '../util/timeUtils';
import ItineraryCircleLine from './ItineraryCircleLine';
import { isKeyboardSelectionEvent } from '../util/browser';

/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
function WaitLeg({ children, leg, startTime, waitTime, focusAction, index }) {
  const modeClassName = 'wait';
  return (
    <div className="row itinerary-row">
      <span className="sr-only">
        <FormattedMessage
          id="wait-amount-of-time"
          values={{
            duration: durationToString(waitTime),
          }}
        />
      </span>
      <div className="small-2 columns itinerary-time-column" aria-hidden="true">
        <div className="itinerary-time-column-time">
          {moment(startTime).format('HH:mm')}
        </div>
        <RouteNumber mode="wait" vertical />
      </div>
      <ItineraryCircleLine modeClassName={modeClassName} index={index} />
      <div
        onClick={focusAction}
        onKeyPress={e => isKeyboardSelectionEvent(e) && focusAction(e)}
        role="button"
        tabIndex="0"
        className="small-9 columns itinerary-instruction-column wait"
      >
        <span className="sr-only">
          <FormattedMessage
            id="itinerary-summary.show-on-map"
            values={{ target: leg.to.name || '' }}
          />
        </span>
        <div className="itinerary-leg-first-row wait" aria-hidden="true">
          <div>
            {leg.to.name}
            <div className="stop-code-container">
              {children}
              {leg.from.stop && (
                <PlatformNumber
                  number={leg.from.stop.platformCode}
                  short
                  isRailOrSubway={
                    modeClassName === 'rail' || modeClassName === 'subway'
                  }
                />
              )}
            </div>
          </div>
          <Icon img="icon-icon_show-on-map" className="itinerary-search-icon" />
        </div>
        <div className="itinerary-leg-action" aria-hidden="true">
          <FormattedMessage
            id="wait-amount-of-time"
            values={{ duration: `(${durationToString(waitTime)})` }}
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
          index={1}
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
