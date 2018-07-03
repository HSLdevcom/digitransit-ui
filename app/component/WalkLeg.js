import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';

import RouteNumber from './RouteNumber';
import Icon from './Icon';
import ComponentUsageExample from './ComponentUsageExample';
import { displayDistance } from '../util/geo-utils';
import { durationToString } from '../util/timeUtils';
import ItineraryCircleLine from './ItineraryCircleLine';

function WalkLeg(props, context) {
  const distance = displayDistance(
    parseInt(props.leg.distance, 10),
    context.config,
  );
  const duration = durationToString(props.leg.duration * 1000);
  const modeClassName = 'walk';

  const { previousLeg } = props;

  /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
  return (
    <div key={props.index} className="row itinerary-row">
      <div className="small-2 columns itinerary-time-column">
        <div className="itinerary-time-column-time">
          {moment(props.leg.startTime).format('HH:mm')}
        </div>
        <RouteNumber mode={props.leg.mode.toLowerCase()} vertical />
      </div>
      <ItineraryCircleLine index={props.index} modeClassName={modeClassName} />
      <div
        onClick={props.focusAction}
        className={`small-9 columns itinerary-instruction-column ${props.leg.mode.toLowerCase()}`}
      >
        <div className="itinerary-leg-first-row">
          <div>
            {previousLeg && previousLeg.rentedBike ? (
              <FormattedMessage
                id="return-cycle-to"
                values={{ station: props.leg.from.name }}
                defaultMessage="Return the bike to {station} station"
              />
            ) : (
              props.leg.from.name
            )}
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
  startTime: t1 + 10000,
  distance: 483.84600000000006,
  mode: 'WALK',
  from: { name: 'Messukeskus', stop: { code: '0613' } },
});

WalkLeg.description = () => {
  const today = moment()
    .hour(12)
    .minute(34)
    .second(0)
    .valueOf();
  return (
    <div>
      <p>Displays an itinerary walk leg.</p>
      <ComponentUsageExample description="walk-start">
        <WalkLeg leg={exampleLeg(today)} index={0} focusAction={() => {}} />
      </ComponentUsageExample>
      <ComponentUsageExample description="walk-middle">
        <WalkLeg leg={exampleLeg(today)} index={1} focusAction={() => {}} />
      </ComponentUsageExample>
    </div>
  );
};

const walkLegShape = PropTypes.shape({
  distance: PropTypes.number.isRequired,
  duration: PropTypes.number.isRequired,
  from: PropTypes.shape({
    name: PropTypes.string.isRequired,
    stop: PropTypes.shape({
      code: PropTypes.string,
    }),
  }).isRequired,
  mode: PropTypes.string.isRequired,
  rentedBike: PropTypes.bool,
  startTime: PropTypes.number.isRequired,
}).isRequired;

WalkLeg.propTypes = {
  children: PropTypes.node,
  focusAction: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  leg: walkLegShape.isRequired,
  previousLeg: walkLegShape,
};

WalkLeg.defaultProps = {
  previousLeg: undefined,
};

WalkLeg.contextTypes = { config: PropTypes.object.isRequired };

export default WalkLeg;
