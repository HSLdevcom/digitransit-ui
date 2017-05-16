import React from 'react';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';

import RouteNumber from './RouteNumber';
import Icon from './Icon';
import ComponentUsageExample from './ComponentUsageExample';
import { displayDistance } from '../util/geo-utils';
import { durationToString } from '../util/timeUtils';
import ItineraryCircleLine from './ItineraryCircleLine';

function CarLeg(props, context) {
  const distance = displayDistance(parseInt(props.leg.distance, 10), context.config);
  const duration = durationToString(props.leg.duration * 1000);
  const firstLegClassName = props.index === 0 ? 'start' : '';
  const modeClassName = 'car';

  return (
    <div key={props.index} className="row itinerary-row" >
      <div className="small-2 columns itinerary-time-column">
        <div className="itinerary-time-column-time">
          {moment(props.leg.startTime).format('HH:mm')}
        </div>
        <RouteNumber mode={props.leg.mode.toLowerCase()} vertical />
      </div>
      <ItineraryCircleLine index={props.index} modeClassName={modeClassName} />
      <div
        onClick={props.focusAction}
        className={`small-10 columns itinerary-instruction-column ${firstLegClassName} ${props.leg.mode.toLowerCase()}`}
      >
        <div className="itinerary-leg-first-row">
          <div>
            {props.leg.from.name}
            {props.children}
            {props.leg.from.stop && props.leg.from.stop.code && (
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
            id="car-distance-duration"
            values={{ distance, duration }}
            defaultMessage="Drive {distance} ({duration})}"
          />
        </div>
      </div>
    </div>
  );
}

const exampleLeg = t1 => ({
  duration: 900,
  startTime: t1 + 20000,
  distance: 5678,
  from: { name: 'Ratsukuja', stop: { code: 'E1102' } },
  mode: 'CAR',
});

CarLeg.description = () => {
  const today = moment().hour(12).minute(34).second(0)
                        .valueOf();
  return (
    <div>
      <p>Displays an itinerary car leg.</p>
      <ComponentUsageExample>
        <CarLeg leg={exampleLeg(today)} index={0} focusAction={() => {}} />
      </ComponentUsageExample>
    </div>
  );
};

CarLeg.propTypes = {
  leg: React.PropTypes.shape({
    duration: React.PropTypes.number.isRequired,
    startTime: React.PropTypes.number.isRequired,
    distance: React.PropTypes.number.isRequired,
    from: React.PropTypes.shape({
      name: React.PropTypes.string.isRequired,
      stop: React.PropTypes.shape({
        code: React.PropTypes.string,
      }),
    }).isRequired,
    mode: React.PropTypes.string.isRequired,
  }).isRequired,
  index: React.PropTypes.number.isRequired,
  focusAction: React.PropTypes.func.isRequired,
  children: React.PropTypes.node,
};

CarLeg.contextTypes = { config: React.PropTypes.object.isRequired };

export default CarLeg;
