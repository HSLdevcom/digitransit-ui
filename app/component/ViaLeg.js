import React from 'react';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';

import RouteNumber from './RouteNumber';
import Icon from './Icon';
import ComponentUsageExample from './ComponentUsageExample';
import { displayDistance } from '../util/geo-utils';
import { durationToString } from '../util/timeUtils';
import ItineraryCircleLine from './ItineraryCircleLine';

function ViaLeg(props, context) {
  const distance = displayDistance(parseInt(props.leg.distance, 10), context.config);
  const duration = durationToString(props.leg.duration * 1000);
  const stayDuration = durationToString(props.leg.startTime - props.arrivalTime);

  return (
    <div key={props.index} className="row itinerary-row" >
      <div className="small-2 columns itinerary-time-column via-time-column">
        <div className="itinerary-time-column-time via-arrival-time">
          {moment(props.arrivalTime).format('HH:mm')}
        </div>
        <div className="itinerary-time-column-time via-divider">
          <div className="via-divider-line" />
        </div>
        <div className="itinerary-time-column-time via-departure-time">
          {moment(props.leg.startTime).format('HH:mm')}
        </div>
        <RouteNumber mode={props.leg.mode.toLowerCase()} vertical />
      </div>
      <ItineraryCircleLine isVia index={props.index} modeClassName="via" />
      <div
        onClick={props.focusAction}
        className={'small-10 columns itinerary-instruction-column via'}
      >
        <div className="itinerary-leg-first-row">
          <div>
            {props.leg.from.name}
            {props.leg.from.stop && props.leg.from.stop.code && (
              <Icon
                img="icon-icon_arrow-collapse--right"
                className="itinerary-leg-first-row__arrow"
              />
            )}
            <div className="itinerary-via-leg-duration">
              <FormattedMessage
                id="via-leg-stop-duration"
                values={{ stayDuration }}
                defaultMessage="At via point {stayDuration}"
              />
            </div>
            {props.children}
          </div>
          <Icon img="icon-icon_search-plus" className="itinerary-search-icon" />
        </div>
        <div className="itinerary-leg-action">
          <FormattedMessage
            id="walk-distance-duration"
            values={{ distance, duration }}
            defaultMessage="Walk {distance} ({duration})"
          />
        </div>
      </div>
    </div>
  );
}

const exampleLeg = t1 => ({
  duration: 438,
  arrivalTime: t1,
  startTime: t1 + 900000,
  distance: 483.846,
  mode: 'WALK',
  from: { name: 'Messukeskus', stop: { code: '0613' } },
});

ViaLeg.description = () => {
  const today = moment().hour(12).minute(34).second(0)
                        .valueOf();
  return (
    <div>
      <p>Displays an itinerary via leg.
         Note that the times are supposed to go on top of the previous leg.
      </p>
      <ComponentUsageExample>
        <ViaLeg
          arrivalTime={today}
          leg={exampleLeg(today)}
          index={1}
          focusAction={() => {}}
        />
      </ComponentUsageExample>
    </div>
  );
};

ViaLeg.propTypes = {
  arrivalTime: React.PropTypes.number.isRequired,
  leg: React.PropTypes.shape({
    duration: React.PropTypes.number.isRequired,
    startTime: React.PropTypes.number.isRequired,
    distance: React.PropTypes.number.isRequired,
    mode: React.PropTypes.string.isRequired,
    from: React.PropTypes.shape({
      name: React.PropTypes.string.isRequired,
      stop: React.PropTypes.shape({
        code: React.PropTypes.string,
      }),
    }).isRequired,
  }).isRequired,
  index: React.PropTypes.number.isRequired,
  isVia: React.PropTypes.bool,
  focusAction: React.PropTypes.func.isRequired,
  children: React.PropTypes.node,
};

ViaLeg.contextTypes = { config: React.PropTypes.object.isRequired };

export default ViaLeg;
