import React from 'react';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';

import RouteNumber from './RouteNumber';
import ComponentUsageExample from './ComponentUsageExample';
import Icon from './Icon';
import { durationToString } from '../util/timeUtils';

function WaitLeg(props) {
  return (
    <div style={{ width: '100%' }} className="row itinerary-row">
      <div className="small-2 columns itinerary-time-column">
        <div className="itinerary-time-column-time">
          {moment(props.startTime).format('HH:mm')}
        </div>
        <RouteNumber mode="wait" vertical />
      </div>
      <div
        onClick={props.focusAction}
        className="small-10 columns itinerary-instruction-column wait"
      >
        <div className="itinerary-leg-first-row">
          <div>
            {props.leg.to.name}
            {props.children}
            {props.children && (
              <Icon
                img="icon-icon_arrow-collapse--right"
                className="itinerary-leg-first-row__arrow"
              />
            )}
          </div>
          <Icon img="icon-icon_search-plus" className="itinerary-search-icon" />
        </div>
        <div className="itinerary-leg-action">
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
  const today = moment().hour(12).minute(34).second(0)
                        .valueOf();
  const leg = exampleLeg();
  const duration = moment.duration(17, 'minutes').asMilliseconds();
  return (
    <div>
      <p>Displays an itinerary wait leg.</p>
      <ComponentUsageExample>
        <WaitLeg startTime={today} focusAction={() => {}} waitTime={duration} leg={leg} />
      </ComponentUsageExample>
    </div>
  );
};

WaitLeg.propTypes = {
  startTime: React.PropTypes.number.isRequired,
  focusAction: React.PropTypes.func.isRequired,
  children: React.PropTypes.node,
  waitTime: React.PropTypes.number.isRequired,
  leg: React.PropTypes.shape({
    to: React.PropTypes.shape({
      name: React.PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default WaitLeg;
